import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useB2BServices } from "@/hooks/use-b2b-services";

const empty = { name: "", description: "", image_url: "", sort_order: "0", is_active: true };

export default function AdminB2BServices() {
  const qc = useQueryClient();
  const { data: services, isLoading } = useB2BServices(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputClass = "w-full border border-border bg-background px-3 py-2 text-sm";

  const refresh = () => qc.invalidateQueries({ queryKey: ["b2b-services"] });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Service name is required");
    setSaving(true);
    const payload = {
      name: form.name.trim().slice(0, 120),
      description: form.description.trim().slice(0, 2000) || null,
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    const { error } = editingId
      ? await supabase.from("b2b_services").update(payload).eq("id", editingId)
      : await supabase.from("b2b_services").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Service updated" : "Service added");
    setForm(empty);
    setEditingId(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this service?")) return;
    const { error } = await supabase.from("b2b_services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Service removed");
    if (editingId === id) { setEditingId(null); setForm(empty); }
    refresh();
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-2">B2B Services</h1>
      <p className="text-xs text-muted-foreground mb-6">Services are inquiry-based — buyers request a quote, no fixed prices are shown.</p>
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={save} className="border border-border p-6 space-y-4">
          <h2 className="font-heading font-bold">{editingId ? "Edit service" : "Add service"}</h2>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Name</label>
            <input className={inputClass} maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Description</label>
            <textarea rows={4} maxLength={2000} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold">Image URL (optional)</label>
            <input className={inputClass} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs uppercase tracking-wide font-semibold">Display order</label>
              <input type="number" className={inputClass} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm pb-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Visible
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{editingId ? "Update" : "Add service"}</Button>
            {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</Button>}
          </div>
        </form>

        <div className="border border-border divide-y divide-border">
          {isLoading ? <p className="p-4 text-sm text-muted-foreground">Loading...</p> :
            services && services.length > 0 ? services.map((s) => (
              <div key={s.id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{s.name} {!s.is_active && <span className="ml-2 text-[10px] uppercase border border-border px-1">Hidden</span>}</p>
                  {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label="Edit service" onClick={() => {
                    setEditingId(s.id);
                    setForm({ name: s.name, description: s.description || "", image_url: s.image_url || "", sort_order: String(s.sort_order), is_active: s.is_active });
                  }}><Pencil size={16} /></Button>
                  <Button size="icon" variant="ghost" aria-label="Remove service" onClick={() => remove(s.id)}><Trash2 size={16} /></Button>
                </div>
              </div>
            )) : <p className="p-4 text-sm text-muted-foreground">No services yet.</p>}
        </div>
      </div>
    </div>
  );
}
