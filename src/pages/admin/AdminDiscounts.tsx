import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminDiscounts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", type: "percentage" as string, value: "", min_quantity: "1",
    start_date: "", end_date: "", product_ids: [] as string[], category_ids: [] as string[],
  });

  const { data: discounts, isLoading } = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discounts")
        .select("*, discount_products(product_id, category_id, products(name), categories(name))")
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

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        type: form.type as any,
        value: parseFloat(form.value) || 0,
        min_quantity: parseInt(form.min_quantity) || 1,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      let discountId: string;

      if (editing) {
        const { error } = await supabase.from("discounts").update(payload).eq("id", editing.id);
        if (error) throw error;
        discountId = editing.id;
        // Clear old product links
        await supabase.from("discount_products").delete().eq("discount_id", discountId);
      } else {
        const { data, error } = await supabase.from("discounts").insert(payload).select().single();
        if (error) throw error;
        discountId = data.id;
      }

      // Insert product links
      const links: { discount_id: string; product_id?: string; category_id?: string }[] = [];
      form.product_ids.forEach((pid) => links.push({ discount_id: discountId, product_id: pid }));
      form.category_ids.forEach((cid) => links.push({ discount_id: discountId, category_id: cid }));
      if (links.length > 0) {
        const { error } = await supabase.from("discount_products").insert(links);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      toast.success(editing ? "Discount updated" : "Discount created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("discount_products").delete().eq("discount_id", id);
      const { error } = await supabase.from("discounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      toast.success("Discount deleted");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("discounts").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-discounts"] }),
  });

  const resetForm = () => {
    setForm({ name: "", type: "percentage", value: "", min_quantity: "1", start_date: "", end_date: "", product_ids: [], category_ids: [] });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (d: any) => {
    const dpProducts = d.discount_products?.filter((dp: any) => dp.product_id).map((dp: any) => dp.product_id) || [];
    const dpCategories = d.discount_products?.filter((dp: any) => dp.category_id).map((dp: any) => dp.category_id) || [];
    setForm({
      name: d.name,
      type: d.type,
      value: String(d.value),
      min_quantity: String(d.min_quantity || 1),
      start_date: d.start_date ? d.start_date.slice(0, 16) : "",
      end_date: d.end_date ? d.end_date.slice(0, 16) : "",
      product_ids: dpProducts,
      category_ids: dpCategories,
    });
    setEditing(d);
    setShowForm(true);
  };

  const toggleSelection = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Discounts</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
          <Plus size={14} /> Add Discount
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing ? "Edit Discount" : "New Discount"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Name (e.g. Summer Sale 20%)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="percentage">Percentage</option>
              <option value="bulk">Bulk (buy X+)</option>
              <option value="bundle">Bundle</option>
              <option value="first_order">First Order</option>
            </select>
            <input placeholder="Value" type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Min Quantity" type="number" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1">Start Date</label>
              <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1">End Date</label>
              <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>

          {/* Product selection */}
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-2">Apply to Products</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-border p-2">
              {products?.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm({ ...form, product_ids: toggleSelection(form.product_ids, p.id) })}
                  className={`px-3 py-1 text-xs border transition-colors ${form.product_ids.includes(p.id) ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-2">Apply to Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories?.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, category_ids: toggleSelection(form.category_ids, c.id) })}
                  className={`px-3 py-1 text-xs border transition-colors ${form.category_ids.includes(c.id) ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
                >
                  {c.name}
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
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applies To</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : discounts && discounts.length > 0 ? discounts.map((d: any) => {
              const appliesTo = [
                ...(d.discount_products?.filter((dp: any) => dp.products).map((dp: any) => dp.products.name) || []),
                ...(d.discount_products?.filter((dp: any) => dp.categories).map((dp: any) => `[${dp.categories.name}]`) || []),
              ];
              return (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                  <td className="px-4 py-3">{d.type === "percentage" ? `${d.value}%` : `$${Number(d.value).toFixed(2)}`}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{appliesTo.join(", ") || "All"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive.mutate({ id: d.id, is_active: !d.is_active })} className={d.is_active ? "text-primary" : "text-muted-foreground"}>
                      {d.is_active ? "✓" : "✗"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(d)} className="hover:text-primary"><Pencil size={14} /></button>
                      <button onClick={() => deleteMutation.mutate(d.id)} className="hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No discounts yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
