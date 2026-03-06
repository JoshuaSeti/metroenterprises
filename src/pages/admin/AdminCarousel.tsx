import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminCarousel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    headline: "", subtext: "", image_url: "", cta_label: "", cta_link: "", campaign_id: "",
  });

  const { data: slides, isLoading } = useQuery({
    queryKey: ["admin-carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*, promo_campaigns(name)")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["admin-campaigns-list"],
    queryFn: async () => {
      const { data } = await supabase.from("promo_campaigns").select("id, name").eq("is_active", true).order("name");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        headline: form.headline,
        subtext: form.subtext || null,
        image_url: form.image_url,
        cta_label: form.cta_label || null,
        cta_link: form.cta_link || null,
        campaign_id: form.campaign_id || null,
        sort_order: editing ? editing.sort_order : (slides?.length || 0),
      };
      if (editing) {
        const { error } = await supabase.from("carousel_slides").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("carousel_slides").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success(editing ? "Slide updated" : "Slide created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("carousel_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel"] });
      toast.success("Slide deleted");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("carousel_slides").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-carousel"] }),
  });

  const reorder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!slides) return;
      const idx = slides.findIndex((s) => s.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= slides.length) return;

      const a = slides[idx];
      const b = slides[swapIdx];
      await supabase.from("carousel_slides").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("carousel_slides").update({ sort_order: a.sort_order }).eq("id", b.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-carousel"] }),
  });

  const resetForm = () => {
    setForm({ headline: "", subtext: "", image_url: "", cta_label: "", cta_link: "", campaign_id: "" });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (s: any) => {
    setForm({
      headline: s.headline,
      subtext: s.subtext || "",
      image_url: s.image_url,
      cta_label: s.cta_label || "",
      cta_link: s.cta_link || "",
      campaign_id: s.campaign_id || "",
    });
    setEditing(s);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Carousel Slides</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
          <Plus size={14} /> Add Slide
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing ? "Edit Slide" : "New Slide"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Subtext" value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring md:col-span-2" />
            <input placeholder="CTA Label (e.g. Shop Now)" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="CTA Link (e.g. /shop)" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">No Campaign</option>
              {campaigns?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-foreground text-background px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={resetForm} className="border border-border px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : slides && slides.length > 0 ? slides.map((s, idx) => (
          <div key={s.id} className="border border-border p-4 flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <button onClick={() => reorder.mutate({ id: s.id, direction: "up" })} disabled={idx === 0} className="hover:text-primary disabled:opacity-30"><ArrowUp size={14} /></button>
              <button onClick={() => reorder.mutate({ id: s.id, direction: "down" })} disabled={idx === slides.length - 1} className="hover:text-primary disabled:opacity-30"><ArrowDown size={14} /></button>
            </div>
            <div className="w-24 h-14 bg-secondary overflow-hidden flex-shrink-0">
              <img src={s.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{s.headline}</p>
              <p className="text-xs text-muted-foreground truncate">{s.subtext || "No subtext"}</p>
              {s.cta_label && <p className="text-xs text-primary mt-1">{s.cta_label} → {s.cta_link}</p>}
            </div>
            <button onClick={() => toggleActive.mutate({ id: s.id, is_active: !s.is_active })} className={`text-xs font-semibold ${s.is_active ? "text-primary" : "text-muted-foreground"}`}>
              {s.is_active ? "Active" : "Hidden"}
            </button>
            <button onClick={() => startEdit(s)} className="hover:text-primary"><Pencil size={14} /></button>
            <button onClick={() => deleteMutation.mutate(s.id)} className="hover:text-destructive"><Trash2 size={14} /></button>
          </div>
        )) : (
          <p className="text-muted-foreground text-center py-8">No slides yet</p>
        )}
      </div>
    </div>
  );
}
