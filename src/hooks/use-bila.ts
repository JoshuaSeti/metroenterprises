import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";

export type BilaPayment = Tables<"bila_payments">;

export async function invokeBila<T>(body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke("bila-payment", { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const details = await error.context.json().catch(() => null);
      throw new Error(typeof details?.error === "string" ? details.error : "Unable to contact Bila");
    }
    throw new Error("Unable to contact Bila");
  }
  return data as T;
}

export function useBilaAvailability() {
  return useQuery({ queryKey: ["bila-availability"], retry: false,
    queryFn: () => invokeBila<{ available: boolean }>({ action: "availability" }),
  });
}

export function usePrepareBila() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { checkoutToken: string; address: string; promoCodeId: string | null;
      items: { product_id: string; quantity: number }[] }) => invokeBila<{ payment: BilaPayment }>({ action: "prepare", ...input }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); qc.invalidateQueries({ queryKey: ["bila-payments"] }); },
  });
}

export function useBilaPayments() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["bila-payments", user?.id], enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("bila_payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}