import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", image_url: "", category_id: "", stock_quantity: "0" });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description || null,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        category_id: form.category_id || null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editing ? "Product updated" : "Product created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
  });

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", price: "", image_url: "", category_id: "", stock_quantity: "0" });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (p: any) => {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      stock_quantity: String(p.stock_quantity),
    });
    setEditing(p);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing ? "Edit Product" : "New Product"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Stock" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">No category</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none" rows={3} />
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
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stock</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : products && products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(p as any).categories?.name || "—"}</td>
                  <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="hover:text-primary transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
