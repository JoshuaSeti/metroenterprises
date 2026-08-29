import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import InquiryChat from "@/components/InquiryChat";

const statuses = ["open", "in_progress", "quoted", "closed"] as const;

export default function AdminB2B() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-b2b-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_inquiries")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 20000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("b2b_inquiries").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-inquiries"] });
      toast.success("Status updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const selected = inquiries?.find((i) => i.id === selectedId);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">B2B Inquiries</h1>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : inquiries && inquiries.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border border-border divide-y divide-border max-h-[520px] overflow-y-auto">
            {inquiries.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelectedId(i.id)}
                className={`w-full text-left p-4 transition-colors ${selectedId === i.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
              >
                <p className="text-sm font-medium">{i.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {i.categories?.name || "Uncategorised"}
                  {i.quantity ? ` · ${i.quantity} units` : ""} · {new Date(i.created_at).toLocaleDateString()}
                </p>
                <select
                  value={i.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus.mutate({ id: i.id, status: e.target.value })}
                  className="mt-2 border border-border bg-background px-2 py-1 text-xs"
                >
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </button>
            ))}
          </div>

          <div>
            {selected ? (
              <InquiryChat inquiry={selected} isAdmin />
            ) : (
              <div className="border border-border p-8 text-sm text-muted-foreground">Select an inquiry to open the chat.</div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
      )}
    </div>
  );
}
