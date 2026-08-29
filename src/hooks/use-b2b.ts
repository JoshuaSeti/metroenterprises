import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useMyInquiries() {
  return useQuery({
    queryKey: ["b2b-inquiries"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("b2b_inquiries")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useInquiry(id?: string) {
  return useQuery({
    queryKey: ["b2b-inquiry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_inquiries")
        .select("*, categories(name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

export function useInquiryMessages(inquiryId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!inquiryId) return;
    const channel = supabase
      .channel(`b2b-messages-${inquiryId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "b2b_messages", filter: `inquiry_id=eq.${inquiryId}` },
        () => qc.invalidateQueries({ queryKey: ["b2b-messages", inquiryId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [inquiryId, qc]);

  return useQuery({
    queryKey: ["b2b-messages", inquiryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_messages")
        .select("*")
        .eq("inquiry_id", inquiryId!)
        .order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!inquiryId,
    refetchInterval: 15000,
  });
}

export function useSendMessage(inquiryId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, isAdmin, files = [] }: { body: string; isAdmin: boolean; files?: File[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in");

      const paths: string[] = [];
      for (const file of files.slice(0, 6)) {
        const ext = file.name.split(".").pop()?.slice(0, 8) || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("b2b-inquiries").upload(path, file);
        if (error) throw error;
        paths.push(path);
      }

      const { error } = await supabase.from("b2b_messages").insert({
        inquiry_id: inquiryId!,
        sender_id: user.id,
        is_admin: isAdmin,
        body: body.trim().slice(0, 2000),
        image_paths: paths,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["b2b-messages", inquiryId] }),
  });
}

export function useToggleInquiryKeep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_kept }: { id: string; is_kept: boolean }) => {
      const { error } = await supabase.from("b2b_inquiries").update({ is_kept } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-b2b-inquiries"] });
      qc.invalidateQueries({ queryKey: ["b2b-inquiries"] });
    },
  });
}


export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      product_name: string;
      category_id: string | null;
      details: string;
      quantity: number | null;
      target_price: number | null;
      files: File[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to submit an inquiry");

      const paths: string[] = [];
      for (const file of input.files.slice(0, 6)) {
        const ext = file.name.split(".").pop()?.slice(0, 8) || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("b2b-inquiries").upload(path, file);
        if (error) throw error;
        paths.push(path);
      }

      const { data, error } = await supabase
        .from("b2b_inquiries")
        .insert({
          user_id: user.id,
          product_name: input.product_name.trim().slice(0, 120),
          category_id: input.category_id || null,
          details: input.details.trim().slice(0, 2000) || null,
          quantity: input.quantity,
          target_price: input.target_price,
          image_paths: paths,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("b2b_messages").insert({
        inquiry_id: data.id,
        sender_id: user.id,
        is_admin: false,
        body: `New inquiry: ${input.product_name}${input.quantity ? ` — ${input.quantity} units` : ""}${input.details ? `\n\n${input.details}` : ""}`.slice(0, 2000),
      });

      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["b2b-inquiries"] }),
  });
}

export function useSignedImageUrls(paths: string[] | undefined) {
  return useQuery({
    queryKey: ["b2b-images", paths],
    queryFn: async () => {
      if (!paths || paths.length === 0) return [];
      const { data, error } = await supabase.storage.from("b2b-inquiries").createSignedUrls(paths, 3600);
      if (error) throw error;
      return (data || []).map((d) => d.signedUrl).filter(Boolean) as string[];
    },
    enabled: !!paths && paths.length > 0,
  });
}
