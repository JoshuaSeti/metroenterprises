import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useProductTiers } from "@/hooks/use-store-settings";

export default function PriceTiers({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data: tiers } = useProductTiers(productId);
  const [minQty, setMinQty] = useState("");
  const [price, setPrice] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["price-tiers", productId] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_price_tiers").insert({
        product_id: productId,
        min_quantity: Math.max(1, parseInt(minQty, 10) || 0),
        unit_price: parseFloat(price),
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setMinQty(""); setPrice(""); toast.success("Tier added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_price_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const inputClass = "border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="md:col-span-2 border border-border p-4">
      <p className="text-xs uppercase tracking-wide font-semibold mb-1">Bulk pricing tiers</p>
      <p className="text-xs text-muted-foreground mb-3">e.g. K20.00 at the minimum order quantity, K16.00 once 500 units are committed.</p>

      {tiers && tiers.length > 0 && (
        <div className="border border-border divide-y divide-border mb-3">
          {tiers.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>{t.min_quantity}+ units → K{Number(t.unit_price).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} / unit</span>
              <button type="button" onClick={() => remove.mutate(t.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input placeholder="Min quantity" type="number" min="1" value={minQty} onChange={(e) => setMinQty(e.target.value)} className={inputClass} />
        <input placeholder="Unit price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        <button
          type="button"
          onClick={() => {
            if (!minQty || !price) return toast.error("Enter quantity and price");
            add.mutate();
          }}
          className="border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary transition-colors"
        >
          Add tier
        </button>
      </div>
    </div>
  );
}
