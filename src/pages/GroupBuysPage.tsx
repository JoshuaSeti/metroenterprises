import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GroupBuyCard from "@/components/GroupBuyCard";
import ShopTabs from "@/components/ShopTabs";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import {
  useGroupBuys,
  useMyParticipations,
  useJoinGroupBuy,
  useLeaveGroupBuy,
  useCreateGroupBuy,
} from "@/hooks/use-group-buys";

export default function GroupBuysPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: groupBuys, isLoading } = useGroupBuys();
  const { data: participations } = useMyParticipations();
  const join = useJoinGroupBuy();
  const leave = useLeaveGroupBuy();
  const create = useCreateGroupBuy();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", image_url: "", unit_price: "", min_quantity: "10", deadline: "", quantity: "1",
  });

  const joinedMap = new Map((participations || []).map((p: any) => [p.group_buy_id, p.quantity]));

  const requireAuth = () => {
    if (!user) {
      toast.error("Sign in to take part in group buys");
      navigate("/signin");
      return false;
    }
    return true;
  };

  const handleJoin = (id: string) => {
    if (!requireAuth()) return;
    const input = window.prompt("How many units do you want to commit?", "1");
    if (!input) return;
    const quantity = parseInt(input, 10);
    if (!quantity || quantity < 1) return toast.error("Enter a valid quantity");
    join.mutate({ groupBuyId: id, quantity }, {
      onSuccess: () => toast.success("You joined the group buy"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const handleLeave = (id: string) => {
    leave.mutate(id, {
      onSuccess: () => toast.success("You left the group buy"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    create.mutate({
      title: form.title,
      description: form.description,
      image_url: form.image_url,
      unit_price: Number(form.unit_price) || 0,
      min_quantity: Math.max(1, Number(form.min_quantity) || 1),
      deadline: form.deadline || undefined,
      quantity: Math.max(0, Number(form.quantity) || 0),
    }, {
      onSuccess: () => {
        toast.success("Group buy created");
        setShowForm(false);
        setForm({ title: "", description: "", image_url: "", unit_price: "", min_quantity: "10", deadline: "", quantity: "1" });
      },
      onError: (err: any) => toast.error(err.message),
    });
  };

  const inputClass = "w-full border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Shop All</h1>
        <p className="text-muted-foreground mb-6">Phones, laptops, gadgets and trending goods</p>

        <ShopTabs />

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold mb-2">Active Group Buys</h2>
            <p className="text-muted-foreground max-w-xl">
              Team up with other buyers to hit bulk thresholds and unlock wholesale pricing. Join an active group buy or start your own.
            </p>
          </div>
          <button
            onClick={() => { if (requireAuth()) setShowForm(!showForm); }}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors"
          >
            <Plus size={14} /> Start a Group Buy
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="border border-border p-6 mb-10 grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wide font-semibold">Title</label>
              <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wide font-semibold">Details</label>
              <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <label className="text-xs uppercase tracking-wide font-semibold">Minimum units</label>
              <input type="number" min="1" required className={inputClass} value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide font-semibold">Deadline</label>
              <input type="datetime-local" className={inputClass} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide font-semibold">Your commitment (units)</label>
              <input type="number" min="0" className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={create.isPending} className="bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50">
                {create.isPending ? "Creating..." : "Create Group Buy"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wide">Cancel</button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-secondary animate-pulse" />)}
          </div>
        ) : groupBuys && groupBuys.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupBuys.map((gb: any) => (
              <GroupBuyCard
                key={gb.id}
                groupBuy={gb}
                joined={joinedMap.get(gb.id)}
                onJoin={() => handleJoin(gb.id)}
                onLeave={() => handleLeave(gb.id)}
                busy={join.isPending || leave.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No active group buys yet. Start the first one.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
