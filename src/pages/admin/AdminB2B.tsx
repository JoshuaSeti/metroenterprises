import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import InquiryChat from "@/components/InquiryChat";
import { useToggleInquiryKeep } from "@/hooks/use-b2b";


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

  const toggleKeep = useToggleInquiryKeep();

  const selected = inquiries?.find((i) => i.id === selectedId);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-2">B2B Inquiries</h1>
      <p className="text-xs text-muted-foreground mb-6">
        Inquiries and their chats are deleted automatically 30 days after the last activity, unless marked "Keep".
      </p>


      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : inquiries && inquiries.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border border-border divide-y divide-border max-h-[520px] overflow-y-auto">
            {inquiries.map((i) => (
              <div
                key={i.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(i.id)}
                onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(i.id); }}
                className={`w-full text-left p-4 transition-colors cursor-pointer ${selectedId === i.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
              >
                <p className="text-sm font-medium">
                  {i.product_name}
                  {i.is_kept && <span className="ml-2 text-[10px] uppercase tracking-wide border border-border px-1 py-0.5">Kept</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {i.categories?.name || "Uncategorised"}
                  {i.quantity ? ` · ${i.quantity} units` : ""} · {new Date(i.created_at).toLocaleDateString()}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <select
                    value={i.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateStatus.mutate({ id: i.id, status: e.target.value })}
                    className="border border-border bg-background px-2 py-1 text-xs"
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={!!i.is_kept}
                      onChange={(e) =>
                        toggleKeep.mutate(
                          { id: i.id, is_kept: e.target.checked },
                          { onSuccess: () => toast.success(e.target.checked ? "Chat kept" : "Chat will auto-delete"), onError: (err: any) => toast.error(err.message) }
                        )
                      }
                    />
                    Keep
                  </label>
                </div>
              </div>

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
