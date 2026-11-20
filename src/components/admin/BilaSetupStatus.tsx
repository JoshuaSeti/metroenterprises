import { useQuery } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface BilaReadiness {
  keyConfigured: boolean;
  walletConfigured: boolean;
  paymentsEnabled: boolean;
  environment: "live";
}

export default function BilaSetupStatus() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["bila-readiness"],
    retry: false,
    queryFn: async (): Promise<BilaReadiness> => {
      const { data, error } = await supabase.functions.invoke("bila-readiness", { body: {} });
      if (error) {
        if (error instanceof FunctionsHttpError) {
          const details = await error.context.json().catch(() => null);
          throw new Error(typeof details?.error === "string" ? details.error : "Unable to check Bila setup");
        }
        throw new Error("Unable to check Bila setup");
      }
      if (!data || typeof data.keyConfigured !== "boolean" || typeof data.walletConfigured !== "boolean") {
        throw new Error("Unable to check Bila setup");
      }
      return data;
    },
  });

  return (
    <section className="mt-10 border-t border-border pt-6" aria-labelledby="bila-heading">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 id="bila-heading" className="font-heading text-xl font-semibold">Bila Payments</h2>
        <Button variant="ghost" size="icon" className="rounded-none" disabled={isFetching}
          aria-label="Refresh Bila setup" title="Refresh Bila setup" onClick={() => refetch()}>
          <RefreshCw className={isFetching ? "animate-spin motion-reduce:animate-none" : ""} />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Direct key · Live payments</p>
      {isLoading ? <p className="text-sm text-muted-foreground">Checking setup…</p> : error ? (
        <p role="alert" className="text-sm text-destructive">{error.message}</p>
      ) : data ? (
        <>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt>Secret key</dt>
              <dd className={data.keyConfigured ? "flex items-center gap-2 text-primary" : "flex items-center gap-2 text-muted-foreground"}>
                {data.keyConfigured ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
                {data.keyConfigured ? "Saved securely" : "Not configured"}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt>Receiving wallet</dt>
              <dd className={data.walletConfigured ? "flex items-center gap-2 text-primary" : "flex items-center gap-2 text-muted-foreground"}>
                {data.walletConfigured ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
                {data.walletConfigured ? "Configured" : "Required"}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt>Checkout availability</dt>
              <dd>{data.paymentsEnabled ? "Enabled" : "Not enabled"}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground mt-4">Manual payments remain available. Bila payments are requested only when a customer confirms payment.</p>
        </>
      ) : null}
    </section>
  );
}