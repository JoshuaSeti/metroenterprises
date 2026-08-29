import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type PriceTier = {
  id: string;
  product_id: string;
  min_quantity: number;
  unit_price: number;
};

export function useStoreSettings() {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateStoreSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { id: string; default_shipping_time: string; group_buy_default_days: number }) => {
      const { error } = await supabase
        .from("store_settings")
        .update({
          default_shipping_time: values.default_shipping_time,
          group_buy_default_days: values.group_buy_default_days,
        })
        .eq("id", values.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-settings"] }),
  });
}

export function useProductTiers(productId?: string) {
  return useQuery({
    queryKey: ["price-tiers", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_price_tiers")
        .select("*")
        .eq("product_id", productId!)
        .order("min_quantity");
      if (error) throw error;
      return (data || []) as PriceTier[];
    },
    enabled: !!productId,
  });
}

/** Unit price for a given committed quantity, using bulk tiers when reached. */
export function tierPriceFor(basePrice: number, tiers: PriceTier[] | undefined, quantity: number) {
  if (!tiers || tiers.length === 0) return basePrice;
  const reached = tiers
    .filter((t) => quantity >= Number(t.min_quantity))
    .sort((a, b) => Number(b.min_quantity) - Number(a.min_quantity))[0];
  return reached ? Number(reached.unit_price) : basePrice;
}

/** Next cheaper tier that hasn't been unlocked yet. */
export function nextTier(tiers: PriceTier[] | undefined, quantity: number) {
  if (!tiers) return null;
  return (
    tiers
      .filter((t) => quantity < Number(t.min_quantity))
      .sort((a, b) => Number(a.min_quantity) - Number(b.min_quantity))[0] || null
  );
}

export function shippingTimeFor(product: any, settings: any) {
  return product?.shipping_time || settings?.default_shipping_time || null;
}
