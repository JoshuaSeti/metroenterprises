import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { canAccessBilaPayment, normalizeBilaPhone, verifiedCollectionState } from "../_shared/bila-contract.ts";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("availability") }).strict(),
  z.object({ action: z.literal("prepare"), checkoutToken: z.string().uuid(), address: z.string().trim().min(1).max(2000),
    promoCodeId: z.string().uuid().nullable().optional(),
    items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(10000) }).strict()).min(1).max(100),
  }).strict(),
  z.object({ action: z.literal("start"), paymentId: z.string().uuid(), phone: z.string().min(9).max(25),
    operator: z.enum(["airtel", "mtn", "zamtel"]), customerName: z.string().trim().min(1).max(100),
  }).strict(),
  z.object({ action: z.literal("status"), paymentId: z.string().uuid() }).strict(),
]);
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return reply({ error: "Invalid payment details" }, 400);
    const input = parsed.data;
    const key = Deno.env.get("BILA_API_KEY");
    const wallet = Deno.env.get("BILA_WALLET_ID");
    if (input.action === "availability") return reply({ available: Boolean(key && wallet) });
    if (!key || !wallet) return reply({ error: "Bila payments are not available yet" }, 503);
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return reply({ error: "Payment service is unavailable" }, 503);
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return reply({ error: "Sign in required" }, 401);
    const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await client.auth.getUser(authorization.slice(7));
    if (authError || !user) return reply({ error: "Sign in required" }, 401);
    const server = createClient(url, serviceKey, { auth: { persistSession: false } });

    if (input.action === "prepare") {
      const { data, error } = await client.rpc("prepare_bila_checkout", {
        p_items: input.items, p_address: input.address, p_checkout_token: input.checkoutToken, p_promo_code_id: input.promoCodeId ?? null,
      });
      if (error) return reply({ error: error.message }, 400);
      return reply({ payment: data });
    }

    const { data: payment, error: paymentError } = await client.from("bila_payments").select("*")
      .eq("id", input.paymentId).maybeSingle();
    if (paymentError || !payment) return reply({ error: "Payment not found" }, 404);
    let isAdmin = false;
    if (payment.user_id !== user.id && input.action === "status") {
      const { data: adminRole, error: roleError } = await client.rpc("has_role", { _user_id: user.id, _role: "admin" });
      isAdmin = !roleError && adminRole === true;
    }
    if (!canAccessBilaPayment(input.action, payment.user_id, user.id, isAdmin)) return reply({ error: "Payment not found" }, 404);
    if (payment.state === "successful" || payment.state === "failed") return reply({ payment });
    if (input.action === "status" && payment.state === "created") return reply({ payment });

    let path = `/bila/collections/status/${encodeURIComponent(payment.reference)}`;
    let method = "GET";
    let requestBody: string | undefined;
    if (input.action === "start" && payment.state === "created") {
      const phone = normalizeBilaPhone(input.phone);
      if (!phone) return reply({ error: "Enter a valid Zambian mobile money number" }, 400);
      const { data: order } = await client.from("orders").select("total,status,user_id").eq("id", payment.order_id).maybeSingle();
      if (!order || order.status !== "pending" || order.user_id !== user.id || Number(order.total) !== Number(payment.amount)) {
        return reply({ error: "This order cannot be paid; contact the team" }, 409);
      }
      // Claim once before contacting Bila. Timeouts remain ambiguous and must be reconciled, never resubmitted.
      const { data: claimed, error: claimError } = await server.from("bila_payments")
        .update({ state: "submitting", updated_at: new Date().toISOString() })
        .eq("id", payment.id).eq("state", "created").select("id").maybeSingle();
      if (claimError) return reply({ error: "Unable to start payment" }, 503);
      if (!claimed) return reply({ error: "Payment is already being requested; check its status" }, 409);
      method = "POST";
      path = "/bila/collections/mobile-money";
      requestBody = JSON.stringify({ amount: Number(payment.amount), reference: payment.reference, phone,
        operator: input.operator, country: "zm", walletId: wallet, customerName: input.customerName,
        bearer: "merchant", narration: `DIRECT-LINK Order ${payment.order_id.slice(0, 8)}`,
      });
    }
    let provider: Response;
    try {
      provider = await fetch(`https://api.usebila.com/api/v1${path}`, {
        method, headers: { "x-api-key": key, "Content-Type": "application/json" },
        body: requestBody, signal: AbortSignal.timeout(25000),
      });
    } catch {
      return reply({ error: "Bila has not responded yet. Check the payment status before trying anything else." }, 502);
    }
    if (!provider.ok) {
      // Upstream bodies can contain merchant identifiers or credentials. Never echo or log them.
      return reply({ error: "Bila could not process this request. Check the payment status or contact the team.", providerStatus: provider.status }, 502);
    }
    const response = await provider.json().catch(() => null);
    const state = verifiedCollectionState(response, { reference: payment.reference, amount: Number(payment.amount), currency: "ZMW" });
    if (!state) return reply({ error: "Bila returned an unverified payment response. Contact the team before paying again." }, 502);
    if (state === "successful") {
      const { error } = await server.rpc("complete_bila_payment", {
        p_payment_id: payment.id, p_reference: payment.reference, p_amount: Number(payment.amount), p_currency: "ZMW",
      });
      if (error) return reply({ error: "Payment received but order confirmation needs assistance. Do not pay again." }, 409);
    } else {
      const { error } = await server.from("bila_payments").update({ state, updated_at: new Date().toISOString() })
        .eq("id", payment.id).in("state", ["submitting", "pending", "needs_assistance"]);
      if (error) return reply({ error: "Unable to save payment status. Do not pay again; check the status." }, 503);
    }
    const { data: refreshed, error: refreshError } = await client.from("bila_payments").select("*").eq("id", payment.id).single();
    if (refreshError) return reply({ error: "Unable to retrieve payment status" }, 503);
    return reply({ payment: refreshed });
  } catch {
    return reply({ error: "Unable to process payment request" }, 500);
  }
});