import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

// Configuration checks only: this endpoint never contacts Bila or initiates a charge.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anonKey) return respond({ error: "Payment configuration is unavailable" }, 503);
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return respond({ error: "Sign in required" }, 401);
    const client = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await client.auth.getUser(authorization.slice(7));
    if (authError || !user) return respond({ error: "Sign in required" }, 401);
    const { data: isAdmin, error: roleError } = await client.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError || isAdmin !== true) return respond({ error: "Admin access required" }, 403);

    // Only presence is returned. Never return, log, or derive identifiers from credentials.
    return respond({
      keyConfigured: Boolean(Deno.env.get("BILA_API_KEY")),
      walletConfigured: Boolean(Deno.env.get("BILA_WALLET_ID")),
      paymentsEnabled: Boolean(Deno.env.get("BILA_API_KEY") && Deno.env.get("BILA_WALLET_ID")),
      environment: "live",
    });
  } catch {
    return respond({ error: "Unable to check Bila setup" }, 500);
  }
});