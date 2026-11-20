import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { invokeBila } from "@/hooks/use-bila";

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error: ordersError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name)), bila_payments(id,state)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = [...new Set((data || []).map(order => order.user_id))];
      if (userIds.length === 0) return [];
      const { data: profiles, error: profileError } = await supabase.from("profiles").select("user_id,full_name,email").in("user_id", userIds);
      if (profileError) throw profileError;
      return data.map(order => ({ ...order, profiles: profiles?.find(profile => profile.user_id === order.user_id) }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: error => toast.error(error.message),
  });

  const checkPayment = useMutation({
    mutationFn: (paymentId: string) => invokeBila({ action: "status", paymentId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Payment status checked"); },
    onError: error => toast.error(error.message),
  });

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Orders</h1>
      {ordersError && <p role="alert" className="text-sm text-destructive mb-4">Unable to load orders: {ordersError.message}</p>}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : orders && orders.length > 0 ? orders.map((o: any) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{o.profiles?.full_name || o.profiles?.email || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {o.order_items?.map((i: any) => `${i.products?.name} ×${i.quantity}`).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 font-medium">K{Number(o.total).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                <td className="px-4 py-3 text-xs">
                  {o.bila_payments ? <div className="flex items-center gap-2">
                    <span>Bila · {o.bila_payments.state === "successful" ? "Paid" : o.bila_payments.state.replace(/_/g, " ")}</span>
                    {["submitting", "pending", "needs_assistance"].includes(o.bila_payments.state) && (
                      <Button variant="ghost" size="icon" className="rounded-none" title="Check Bila payment" aria-label={`Check Bila payment for order ${o.id.slice(0,8)}`}
                        disabled={checkPayment.isPending} onClick={() => checkPayment.mutate(o.bila_payments.id)}><RefreshCw /></Button>
                    )}
                  </div> : "Manual"}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                    className="border border-border px-2 py-1 text-xs bg-background focus:outline-none"
                  >
                    {statuses.map((s) => <option key={s} value={s} disabled={Boolean(o.bila_payments && o.bila_payments.state !== "successful" && !["pending", "cancelled"].includes(s))}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
