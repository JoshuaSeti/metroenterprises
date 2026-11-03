import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type B2BService = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export function useB2BServices(includeInactive = false) {
  return useQuery({
    queryKey: ["b2b-services", includeInactive],
    queryFn: async () => {
      let q = supabase.from("b2b_services").select("*").order("sort_order").order("created_at");
      if (!includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as B2BService[];
    },
  });
}
