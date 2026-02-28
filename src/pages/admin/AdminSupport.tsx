import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminSupport() {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, profiles!support_tickets_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, status, admin_response }: { id: string; status?: string; admin_response?: string }) => {
      const update: any = {};
      if (status) update.status = status;
      if (admin_response !== undefined) update.admin_response = admin_response;
      const { error } = await supabase.from("support_tickets").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket updated");
    },
  });

  const statusColors: Record<string, string> = {
    open: "bg-warning text-warning-foreground",
    in_progress: "bg-primary text-primary-foreground",
    resolved: "bg-success text-success-foreground",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Support Tickets</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : tickets && tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((t: any) => (
            <div key={t.id} className="border border-border p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{t.subject}</h3>
                  <p className="text-xs text-muted-foreground">{t.profiles?.full_name || t.profiles?.email} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => updateTicket.mutate({ id: t.id, status: e.target.value })}
                  className={`text-xs px-2 py-1 border-none font-semibold uppercase ${statusColors[t.status] || ""}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t.message}</p>
              <textarea
                placeholder="Admin response..."
                defaultValue={t.admin_response || ""}
                onBlur={(e) => updateTicket.mutate({ id: t.id, admin_response: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No tickets</p>
      )}
    </div>
  );
}
