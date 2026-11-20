import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { invokeBila, type BilaPayment } from "@/hooks/use-bila";

export default function BilaOrderPayment({ payment, orderStatus }: { payment: BilaPayment; orderStatus: string }) {
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [operator, setOperator] = useState("airtel");
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(payment);
  const [startError, setStartError] = useState<string | null>(null);
  useEffect(() => setCurrent(payment), [payment]);
  const checking = ["submitting", "pending", "needs_assistance"].includes(current.state);
  const status = useQuery({
    queryKey: ["bila-payment-status", payment.id],
    enabled: checking,
    retry: false,
    refetchInterval: current.state === "needs_assistance" ? false : 10000,
    queryFn: () => invokeBila<{ payment: BilaPayment }>({ action: "status", paymentId: payment.id }),
  });
  useEffect(() => {
    if (!status.data) return;
    setCurrent(status.data.payment);
    setStartError(null);
    if (status.data.payment.state === "successful") {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["bila-payments"] });
      qc.invalidateQueries({ queryKey: ["my-rewards"] });
    }
  }, [status.data, qc]);

  const start = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStartError(null);
    try {
      const result = await invokeBila<{ payment: BilaPayment }>({ action: "start", paymentId: payment.id, phone, operator, customerName: name });
      setCurrent(result.payment);
      qc.invalidateQueries({ queryKey: ["bila-payments"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      if (result.payment.state === "successful") toast.success("Payment verified");
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "Unable to request payment");
      // A failed response can still follow an accepted charge; reload persisted state before allowing any next action.
      qc.invalidateQueries({ queryKey: ["bila-payments"] });
    } finally {
      setBusy(false);
    }
  };

  const amount = Number(current.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inputClass = "w-full min-w-0 border border-border bg-background px-3 py-2 text-sm";
  return (
    <section className="border-t border-border mt-4 pt-4" aria-label="Bila order payment">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="flex items-center gap-2 text-sm font-semibold"><Smartphone size={16} /> Bila Mobile Money</p>
        <span className="text-sm font-semibold">K{amount}</span>
      </div>
      {current.state === "successful" ? (
        <p className="flex items-center gap-2 text-sm text-primary"><CheckCircle2 size={16} /> Payment verified</p>
      ) : current.state === "failed" ? (
        <p className="text-sm text-destructive">Payment failed. Contact our team before attempting another payment.</p>
      ) : current.state === "created" && orderStatus === "pending" ? (
        <form onSubmit={start} className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs font-medium">Mobile money network
              <select aria-label="Mobile money network" value={operator} onChange={e => setOperator(e.target.value)} className={`${inputClass} mt-1`} disabled={busy}>
                <option value="airtel">Airtel Money</option><option value="mtn">MTN MoMo</option><option value="zamtel">Zamtel Kwacha</option>
              </select>
            </label>
            <label className="text-xs font-medium">Mobile money number
              <input aria-label="Mobile money number" type="tel" autoComplete="tel" required maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} className={`${inputClass} mt-1`} disabled={busy} />
            </label>
            <label className="text-xs font-medium">Account holder’s name
              <input aria-label="Account holder’s name" autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} className={`${inputClass} mt-1`} disabled={busy} />
            </label>
          </div>
          <Button type="submit" disabled={busy} className="rounded-none"><Smartphone />{busy ? "Requesting payment…" : `Pay K${amount}`}</Button>
        </form>
      ) : checking ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{current.state === "needs_assistance" ? "This payment needs assistance. Contact our team before paying again." : "Awaiting payment confirmation on your phone."}</p>
          <Button variant="outline" className="rounded-none" disabled={status.isFetching} onClick={() => status.refetch()}>
            <RefreshCw /> Check payment
          </Button>
        </div>
      ) : <p className="text-sm text-muted-foreground">This order is not available for payment.</p>}
      {(startError || status.error) && <p role="alert" className="text-sm text-destructive mt-3">{startError || status.error?.message}</p>}
      {current.state === "created" && <p className="text-xs text-muted-foreground mt-3">Confirm the final amount above. Approve payment only on your phone; never share your mobile money PIN.</p>}
    </section>
  );
}