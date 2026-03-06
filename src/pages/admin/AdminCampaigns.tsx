import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminCampaigns() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", description: "", start_date: "", end_date: "", product_ids: [] as string[],
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_campaigns")
        .select("*, campaign_products(product_id, products(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name").eq("is_active", true).order("name");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        start_date: form.start_date,
        end_date: form.end_date,
      };

      let campaignId: string;
      if (editing) {
        const { error } = await supabase.from("promo_campaigns").update(payload).eq("id", editing.id);
        if (error) throw error;
        campaignId = editing.id;
        await supabase.from("campaign_products").delete().eq("campaign_id", campaignId);
      } else {
        const { data, error } = await supabase.from("promo_campaigns").insert(payload).select().single();
        if (error) throw error;
        campaignId = data.id;
      }

      if (form.product_ids.length > 0) {
        const links = form.product_ids.map((pid) => ({ campaign_id: campaignId, product_id: pid }));
        const { error } = await supabase.from("campaign_products").insert(links);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success(editing ? "Campaign updated" : "Campaign created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("campaign_products").delete().eq("campaign_id", id);
      const { error } = await supabase.from("promo_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign deleted");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("promo_campaigns").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] }),
  });

  const resetForm = () => {
    setForm({ name: "", description: "", start_date: "", end_date: "", product_ids: [] });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (c: any) => {
    setForm({
      name: c.name,
      description: c.description || "",
      start_date: c.start_date?.slice(0, 16) || "",
      end_date: c.end_date?.slice(0, 16) || "",
      product_ids: c.campaign_products?.map((cp: any) => cp.product_id) || [],
    });
    setEditing(c);
    setShowForm(true);
  };

  const toggleProduct = (id: string) =>
    setForm({ ...form, product_ids: form.product_ids.includes(id) ? form.product_ids.filter((x) => x !== id) : [...form.product_ids, id] });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Campaigns</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
          <Plus size={14} /> Add Campaign
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing ? "Edit Campaign" : "New Campaign"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Campaign Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1">Start Date</label>
              <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1">End Date</label>
              <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-2">Campaign Products</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-border p-2">
              {products?.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className={`px-3 py-1 text-xs border transition-colors ${form.product_ids.includes(p.id) ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-foreground text-background px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={resetForm} className="border border-border px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Products</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : campaigns && campaigns.length > 0 ? campaigns.map((c: any) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                  {c.campaign_products?.map((cp: any) => cp.products?.name).filter(Boolean).join(", ") || "None"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive.mutate({ id: c.id, is_active: !c.is_active })} className={c.is_active ? "text-primary" : "text-muted-foreground"}>
                    {c.is_active ? "✓" : "✗"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} className="hover:text-primary"><Pencil size={14} /></button>
                    <button onClick={() => deleteMutation.mutate(c.id)} className="hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No campaigns yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
