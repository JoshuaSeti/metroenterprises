import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type GroupBuy = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  product_id: string | null;
  unit_price: number;
  min_quantity: number;
  committed_quantity: number;
  deadline: string | null;
  status: string;
  created_by: string | null;
  is_published: boolean;
  share_slug: string | null;
  created_at: string;
};

const GROUP_BUY_SELECT =
  "*, products(id, name, slug, image_url, price, shipping_time, group_buy_min_quantity, product_price_tiers(*))";

/** A group buy is failed when its deadline has passed without hitting the threshold. */
export function groupBuyState(gb: any) {
  const committed = Number(gb.committed_quantity || 0);
  const min = Math.max(1, Number(gb.min_quantity || 1));
  const reached = committed >= min;
  const deadline = gb.deadline ? new Date(gb.deadline) : null;
  const expired = deadline ? deadline.getTime() < Date.now() : false;
  const cancelled = gb.status === "cancelled" || (expired && !reached);
  const open = !cancelled && !reached && gb.status === "open" && !expired;
  return { committed, min, reached, deadline, expired, cancelled, open };
}

export function useGroupBuys() {
  return useQuery({
    queryKey: ["group-buys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_buys")
        .select(GROUP_BUY_SELECT)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useGroupBuy(id?: string) {
  return useQuery({
    queryKey: ["group-buy", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_buys")
        .select(GROUP_BUY_SELECT)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

/** Group buys attached to a specific product. */
export function useGroupBuysForProduct(productId?: string) {
  return useQuery({
    queryKey: ["group-buys-product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_buys")
        .select(GROUP_BUY_SELECT)
        .eq("product_id", productId!)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!productId,
  });
}

/** Catalog of products admins have enabled for group buying. */
export function useGroupBuyProducts() {
  return useQuery({
    queryKey: ["group-buy-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug), product_price_tiers(*)")
        .eq("is_active", true)
        .eq("is_group_buy", true)
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useGroupBuyProduct(slug?: string) {
  return useQuery({
    queryKey: ["group-buy-product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug), product_price_tiers(*)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });
}

export function useMyParticipations() {
  return useQuery({
    queryKey: ["group-buy-participations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("group_buy_participants")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["group-buys"] });
  qc.invalidateQueries({ queryKey: ["group-buy"] });
  qc.invalidateQueries({ queryKey: ["group-buys-product"] });
  qc.invalidateQueries({ queryKey: ["group-buy-participations"] });
}

export function useJoinGroupBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupBuyId, quantity }: { groupBuyId: string; quantity: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to join a group buy");
      const { error } = await supabase
        .from("group_buy_participants")
        .upsert(
          { group_buy_id: groupBuyId, user_id: user.id, quantity },
          { onConflict: "group_buy_id,user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useLeaveGroupBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupBuyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in");
      const { error } = await supabase
        .from("group_buy_participants")
        .delete()
        .eq("group_buy_id", groupBuyId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

/** Move a commitment from a cancelled/expired group buy into another one. */
export function useTransferParticipation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fromGroupBuyId, toGroupBuyId, quantity }: { fromGroupBuyId: string; toGroupBuyId: string; quantity: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in");
      const { error: upsertError } = await supabase
        .from("group_buy_participants")
        .upsert(
          { group_buy_id: toGroupBuyId, user_id: user.id, quantity },
          { onConflict: "group_buy_id,user_id" }
        );
      if (upsertError) throw upsertError;
      const { error: delError } = await supabase
        .from("group_buy_participants")
        .delete()
        .eq("group_buy_id", fromGroupBuyId)
        .eq("user_id", user.id);
      if (delError) throw delError;
    },
    onSuccess: () => invalidate(qc),
  });
}

/** A buyer starts their own group buy from a catalog product. */
export function useStartGroupBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, quantity, deadlineDays }: { product: any; quantity: number; deadlineDays: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to start a group buy");

      const minQty = Math.max(1, Number(product.group_buy_min_quantity || 10));
      const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toISOString();
      const shareSlug = `${(product.slug || "group-buy").slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`;

      const { data, error } = await supabase
        .from("group_buys")
        .insert({
          title: product.name,
          description: product.description || null,
          image_url: product.image_url || null,
          product_id: product.id,
          unit_price: Number(product.price),
          min_quantity: minQty,
          deadline,
          share_slug: shareSlug,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      if (quantity > 0) {
        const { error: pError } = await supabase.from("group_buy_participants").insert({
          group_buy_id: data.id,
          user_id: user.id,
          quantity,
        });
        if (pError) throw pError;
      }
      return data;
    },
    onSuccess: () => invalidate(qc),
  });
}
