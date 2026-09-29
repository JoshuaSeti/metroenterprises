import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = {
  title: "", description: "", image_url: "", product_id: "", unit_price: "",
  min_quantity: "10", deadline: "", status: "open", is_published: true,
};

export default function AdminGroupBuys() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);

  const { data: groupBuys, isLoading } = useQuery({
    queryKey: ["admin-group-buys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_buys")
        .select("*, products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
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
      const { data: { user } } = await supabase.auth.getUser();
      const payload: any = {
        title: form.title,
        description: form.description || null,
        image_url: form.image_url || null,
        product_id: form.product_id || null,
        unit_price: Number(form.unit_price) || 0,
        min_quantity: Math.max(1, Number(form.min_quantity) || 1),
        deadline: form.deadline || null,
        status: form.status,
        is_published: form.is_published,
      };
      if (editing) {
        const { error } = await supabase.from("group_buys").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("group_buys").insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group-buys"] });
      toast.success(editing ? "Group buy updated" : "Group buy created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("group_buys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group-buys"] });
      toast.success("Group buy deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("group_buys").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-group-buys"] }),
  });

  const resetForm = () => { setForm(empty); setEditing(null); setShowForm(false); };

  const startEdit = (g: any) => {
    setForm({
      title: g.title,
      description: g.description || "",
      image_url: g.image_url || "",
      product_id: g.product_id || "",
      unit_price: String(g.unit_price ?? ""),
      min_quantity: String(g.min_quantity ?? 1),
      deadline: g.deadline?.slice(0, 16) || "",
      status: g.status,
      is_published: g.is_published,
    });
    setEditing(g);
    setShowForm(true);
  };

  const inputClass = "w-full border border-border bg-background px-3 py-2 text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Group Buys</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
          <Plus size={14} /> Add Group Buy
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          className="border border-border p-6 mb-8 grid md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-wide font-semibold">Title</label>
            <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-wide font-semibold">Details</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Linked product (optional)</label>
            <select className={inputClass} value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
              <option value="">None</option>
              {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Image URL</label>
            <input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Unit price</label>
            <input type="number" step="0.01" min="0" required className={inputClass} value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Minimum units (threshold)</label>
            <input type="number" min="1" required className={inputClass} value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Deadline</label>
            <input type="datetime-local" className={inputClass} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Visible on storefront
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" disabled={saveMutation.isPending} className="bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wide">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : groupBuys && groupBuys.length > 0 ? (
        <div className="border border-border divide-y divide-border">
          {groupBuys.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.committed_quantity) / Math.max(1, Number(g.min_quantity))) * 100));
            return (
              <div key={g.id} className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[220px]">
                  <p className="font-medium text-sm">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    K{Number(g.unit_price).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} / unit · {g.committed_quantity}/{g.min_quantity} units · {g.status}
                    {g.products?.name ? ` · ${g.products.name}` : ""}
                  </p>
                  <div className="h-1.5 w-full bg-secondary mt-2">
                    <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={g.is_published} onChange={(e) => togglePublished.mutate({ id: g.id, is_published: e.target.checked })} />
                  Live
                </label>
                <button onClick={() => startEdit(g)} className="text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                <button onClick={() => { if (confirm("Delete this group buy?")) deleteMutation.mutate(g.id); }} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No group buys yet.</p>
      )}
    </div>
  );
}
