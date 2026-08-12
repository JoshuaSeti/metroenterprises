import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface RewardsSettings {
  id: string;
  is_enabled: boolean;
  program_name: string;
  points_per_currency: number;
  points_per_currency_redeem: number;
  min_redeem_points: number;
  signup_bonus_points: number;
  terms: string | null;
}

export interface RewardsTier {
  id: string;
  name: string;
  min_points: number;
  multiplier: number;
  perks: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export function useRewardsSettings() {
  return useQuery({
    queryKey: ["rewards-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards_settings")
        .select("*")
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as RewardsSettings | null;
    },
  });
}

export function useRewardsTiers(activeOnly = true) {
  return useQuery({
    queryKey: ["rewards-tiers", activeOnly],
    queryFn: async () => {
      let query = supabase.from("rewards_tiers").select("*").order("sort_order");
      if (activeOnly) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RewardsTier[];
    },
  });
}

export function useMyRewards() {
  return useQuery({
    queryKey: ["my-rewards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { balance: 0, transactions: [] as any[] };
      const { data, error } = await supabase
        .from("reward_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const balance = (data || []).reduce((sum, t: any) => sum + Number(t.points), 0);
      return { balance, transactions: data || [] };
    },
  });
}

export function getTierForPoints(points: number, tiers: RewardsTier[]) {
  const sorted = [...tiers].sort((a, b) => a.min_points - b.min_points);
  let current: RewardsTier | null = null;
  let next: RewardsTier | null = null;
  for (const tier of sorted) {
    if (points >= tier.min_points) current = tier;
    else if (!next) next = tier;
  }
  return { current, next };
}

export function pointsToCurrency(points: number, settings: RewardsSettings | null | undefined) {
  if (!settings || !settings.points_per_currency_redeem) return 0;
  return points / Number(settings.points_per_currency_redeem);
}
