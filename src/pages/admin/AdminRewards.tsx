import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Gift } from "lucide-react";
import { useRewardsSettings, useRewardsTiers } from "@/hooks/use-rewards";

const emptyTier = { name: "", min_points: 0, multiplier: 1, perks: "", color: "#2B5E4A", sort_order: 0 };

export default function AdminRewards() {
  const queryClient = useQueryClient();
  const { data: settings } = useRewardsSettings();
  const { data: tiers } = useRewardsTiers(false);

  const [form, setForm] = useState({
    is_enabled: true,
    program_name: "",
    points_per_currency: 1,
    points_per_currency_redeem: 100,
    min_redeem_points: 500,
    signup_bonus_points: 0,
    terms: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        is_enabled: settings.is_enabled,
        program_name: settings.program_name,
        points_per_currency: Number(settings.points_per_currency),
        points_per_currency_redeem: Number(settings.points_per_currency_redeem),
        min_redeem_points: settings.min_redeem_points,
        signup_bonus_points: settings.signup_bonus_points,
        terms: settings.terms || "",
      });
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      const payload = { ...form, terms: form.terms || null };
      if (settings) {
        const { error } = await supabase.from("rewards_settings").update(payload).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rewards_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards-settings"] });
      toast.success("Rewards settings saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Tiers
  const [tierForm, setTierForm] = useState<any>(emptyTier);
  const [editingTier, setEditingTier] = useState<any>(null);
  const [showTierForm, setShowTierForm] = useState(false);

  const saveTier = useMutation({
    mutationFn: async () => {
      const payload = {
        name: tierForm.name,
        min_points: Number(tierForm.min_points),
        multiplier: Number(tierForm.multiplier),
        perks: tierForm.perks || null,
        color: tierForm.color,
        sort_order: Number(tierForm.sort_order),
      };
      if (editingTier) {
        const { error } = await supabase.from("rewards_tiers").update(payload).eq("id", editingTier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rewards_tiers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards-tiers"] });
      toast.success(editingTier ? "Tier updated" : "Tier created");
      setShowTierForm(false);
      setEditingTier(null);
      setTierForm(emptyTier);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rewards_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards-tiers"] });
      toast.success("Tier deleted");
    },
  });

  const toggleTier = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("rewards_tiers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rewards-tiers"] }),
  });

  // Members
  const { data: members } = useQuery({
    queryKey: ["admin-rewards-members"],
    queryFn: async () => {
      const [{ data: profiles }, { data: txns }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, email").order("created_at", { ascending: false }),
        supabase.from("reward_transactions").select("user_id, points"),
      ]);
      const balances = new Map<string, number>();
      (txns || []).forEach((t: any) => balances.set(t.user_id, (balances.get(t.user_id) || 0) + Number(t.points)));
      return (profiles || []).map((p: any) => ({ ...p, balance: balances.get(p.user_id) || 0 }));
    },
  });

  const [adjust, setAdjust] = useState<{ user_id: string; email: string } | null>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const saveAdjustment = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("reward_transactions").insert({
        user_id: adjust!.user_id,
        points: parseInt(adjustPoints, 10),
        reason: "manual_adjustment",
        note: adjustNote || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards-members"] });
      toast.success("Points adjusted");
      setAdjust(null);
      setAdjustPoints("");
      setAdjustNote("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const input = "w-full border border-border bg-background px-3 py-2 text-sm";
  const label = "block text-xs font-semibold uppercase tracking-wide mb-1";

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Gift size={22} />
        <h1 className="font-heading text-2xl font-bold">Rewards Program</h1>
      </div>

      {/* Settings */}
      <section className="border border-border p-6 mb-10">
        <h2 className="font-heading text-lg font-semibold mb-4">Program Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Program Name</label>
            <input className={input} value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} />
              Program enabled
            </label>
          </div>
          <div>
            <label className={label}>Points earned per K1 spent</label>
            <input type="number" step="0.01" className={input} value={form.points_per_currency} onChange={(e) => setForm({ ...form, points_per_currency: Number(e.target.value) })} />
          </div>
          <div>
            <label className={label}>Points needed for K1 redeemed</label>
            <input type="number" step="1" className={input} value={form.points_per_currency_redeem} onChange={(e) => setForm({ ...form, points_per_currency_redeem: Number(e.target.value) })} />
          </div>
          <div>
            <label className={label}>Minimum points to redeem</label>
            <input type="number" className={input} value={form.min_redeem_points} onChange={(e) => setForm({ ...form, min_redeem_points: Number(e.target.value) })} />
          </div>
          <div>
            <label className={label}>Signup bonus points</label>
            <input type="number" className={input} value={form.signup_bonus_points} onChange={(e) => setForm({ ...form, signup_bonus_points: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Terms / description</label>
            <textarea rows={3} className={input} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
          </div>
        </div>
        <button
          onClick={() => saveSettings.mutate()}
          disabled={saveSettings.isPending}
          className="mt-4 bg-primary text-primary-foreground px-6 py-2 text-xs font-semibold uppercase tracking-wide"
        >
          Save Settings
        </button>
      </section>

      {/* Tiers */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Tiers</h2>
          <button
            onClick={() => { setEditingTier(null); setTierForm(emptyTier); setShowTierForm(!showTierForm); }}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
          >
            <Plus size={14} /> New Tier
          </button>
        </div>

        {showTierForm && (
          <div className="border border-border p-6 mb-4 grid md:grid-cols-3 gap-4">
            <div>
              <label className={label}>Name</label>
              <input className={input} value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} />
            </div>
            <div>
              <label className={label}>Minimum points</label>
              <input type="number" className={input} value={tierForm.min_points} onChange={(e) => setTierForm({ ...tierForm, min_points: e.target.value })} />
            </div>
            <div>
              <label className={label}>Earn multiplier</label>
              <input type="number" step="0.05" className={input} value={tierForm.multiplier} onChange={(e) => setTierForm({ ...tierForm, multiplier: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Perks</label>
              <input className={input} value={tierForm.perks} onChange={(e) => setTierForm({ ...tierForm, perks: e.target.value })} />
            </div>
            <div>
              <label className={label}>Colour</label>
              <input type="color" className="w-full h-10 border border-border bg-background" value={tierForm.color} onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })} />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button onClick={() => saveTier.mutate()} className="bg-primary text-primary-foreground px-6 py-2 text-xs font-semibold uppercase tracking-wide">
                {editingTier ? "Update" : "Create"}
              </button>
              <button onClick={() => { setShowTierForm(false); setEditingTier(null); }} className="border border-border px-6 py-2 text-xs font-semibold uppercase tracking-wide">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="border border-border divide-y divide-border">
          {(tiers || []).map((t: any) => (
            <div key={t.id} className="flex items-center gap-4 p-4">
              <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: t.color }} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.min_points}+ points · {t.multiplier}× earning{t.perks ? ` · ${t.perks}` : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={t.is_active} onChange={(e) => toggleTier.mutate({ id: t.id, is_active: e.target.checked })} />
                Active
              </label>
              <button onClick={() => { setEditingTier(t); setTierForm({ ...t, perks: t.perks || "" }); setShowTierForm(true); }} className="text-muted-foreground hover:text-foreground">
                <Pencil size={16} />
              </button>
              <button onClick={() => deleteTier.mutate(t.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!tiers || tiers.length === 0) && <p className="p-4 text-sm text-muted-foreground">No tiers yet</p>}
        </div>
      </section>

      {/* Members */}
      <section>
        <h2 className="font-heading text-lg font-semibold mb-4">Member Balances</h2>
        <div className="border border-border divide-y divide-border">
          {(members || []).map((m: any) => (
            <div key={m.user_id} className="flex items-center gap-4 p-4 text-sm">
              <div className="flex-1">
                <p className="font-medium">{m.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className="font-semibold">{m.balance} pts</span>
              <button
                onClick={() => setAdjust({ user_id: m.user_id, email: m.email })}
                className="border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-secondary"
              >
                Adjust
              </button>
            </div>
          ))}
          {(!members || members.length === 0) && <p className="p-4 text-sm text-muted-foreground">No members yet</p>}
        </div>
      </section>

      {adjust && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border p-6 w-full max-w-md">
            <h3 className="font-heading text-lg font-semibold mb-1">Adjust Points</h3>
            <p className="text-xs text-muted-foreground mb-4">{adjust.email}</p>
            <label className={label}>Points (negative to deduct)</label>
            <input type="number" className={input} value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} />
            <label className={`${label} mt-4`}>Note</label>
            <input className={input} value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => saveAdjustment.mutate()}
                disabled={!adjustPoints || saveAdjustment.isPending}
                className="bg-primary text-primary-foreground px-6 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
              >
                Save
              </button>
              <button onClick={() => setAdjust(null)} className="border border-border px-6 py-2 text-xs font-semibold uppercase tracking-wide">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
