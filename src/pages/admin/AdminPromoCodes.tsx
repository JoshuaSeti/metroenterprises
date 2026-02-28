import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function AdminPromoCodes() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage" as string, value: "", free_shipping: false, usage_limit: "", expires_at: "" });

  const { data: codes, isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("promo_codes").insert([{
        code: form.code.toUpperCase(),
        type: form.type as any,
        value: parseFloat(form.value) || 0,
        free_shipping: form.free_shipping,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Promo code created");
      setForm({ code: "", type: "percentage", value: "", free_shipping: false, usage_limit: "", expires_at: "" });
      setShowForm(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast.success("Promo code deleted");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Promo Codes</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors">
          <Plus size={14} /> Add Code
        </button>
      </div>

      {showForm && (
        <div className="border border-border p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Code (e.g. SUMMER20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="combination">Combination</option>
            </select>
            <input placeholder="Value" type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input placeholder="Usage Limit" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.free_shipping} onChange={(e) => setForm({ ...form, free_shipping: e.target.checked })} />
              Free Shipping
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-foreground text-background px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50">Save</button>
            <button onClick={() => setShowForm(false)} className="border border-border px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Uses</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : codes?.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3">{c.type === "percentage" ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}</td>
                <td className="px-4 py-3">{c.usage_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</td>
                <td className="px-4 py-3">{c.is_active ? "✓" : "✗"}</td>
                <td className="px-4 py-3"><button onClick={() => deleteMutation.mutate(c.id)} className="hover:text-destructive"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
