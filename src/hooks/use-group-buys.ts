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
  created_at: string;
};

export function useGroupBuys() {
  return useQuery({
    queryKey: ["group-buys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_buys")
        .select("*, products(name, slug, image_url)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-buys"] });
      qc.invalidateQueries({ queryKey: ["group-buy-participations"] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-buys"] });
      qc.invalidateQueries({ queryKey: ["group-buy-participations"] });
    },
  });
}

export function useCreateGroupBuy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: {
      title: string;
      description?: string;
      image_url?: string;
      unit_price: number;
      min_quantity: number;
      deadline?: string;
      quantity: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to create a group buy");
      const { data, error } = await supabase
        .from("group_buys")
        .insert({
          title: form.title,
          description: form.description || null,
          image_url: form.image_url || null,
          unit_price: form.unit_price,
          min_quantity: form.min_quantity,
          deadline: form.deadline || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      if (form.quantity > 0) {
        await supabase.from("group_buy_participants").insert({
          group_buy_id: data.id,
          user_id: user.id,
          quantity: form.quantity,
        });
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-buys"] });
      qc.invalidateQueries({ queryKey: ["group-buy-participations"] });
    },
  });
}
