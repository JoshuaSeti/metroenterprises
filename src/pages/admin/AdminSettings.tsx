import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStoreSettings, useUpdateStoreSettings } from "@/hooks/use-store-settings";

export default function AdminSettings() {
  const { data: settings, isLoading } = useStoreSettings();
  const update = useUpdateStoreSettings();
  const [shipping, setShipping] = useState("");
  const [days, setDays] = useState("14");

  useEffect(() => {
    if (settings) {
      setShipping(settings.default_shipping_time || "");
      setDays(String(settings.group_buy_default_days ?? 14));
    }
  }, [settings]);

  const inputClass = "w-full border border-border bg-background px-3 py-2 text-sm";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    update.mutate(
      {
        id: settings.id,
        default_shipping_time: shipping,
        group_buy_default_days: Math.max(1, parseInt(days, 10) || 14),
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold mb-6">Store Settings</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="border border-border p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Default shipping time</label>
            <input className={inputClass} value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="e.g. 2-4 weeks" />
            <p className="text-xs text-muted-foreground mt-1">Shown on every product that doesn't have its own shipping time.</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Group buy duration (days)</label>
            <input type="number" min="1" className={inputClass} value={days} onChange={(e) => setDays(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Default deadline applied when a buyer starts a group buy.</p>
          </div>
          <button
            type="submit"
            disabled={update.isPending}
            className="bg-foreground text-background px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50"
          >
            {update.isPending ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}
