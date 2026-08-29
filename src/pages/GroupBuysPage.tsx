import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GroupBuyCard from "@/components/GroupBuyCard";
import ShopTabs from "@/components/ShopTabs";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
import {
  useGroupBuys,
  useMyParticipations,
  useJoinGroupBuy,
  useLeaveGroupBuy,
  groupBuyState,
} from "@/hooks/use-group-buys";

export default function GroupBuysPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: groupBuys, isLoading } = useGroupBuys();
  const { data: participations } = useMyParticipations();
  const join = useJoinGroupBuy();
  const leave = useLeaveGroupBuy();

  const joinedMap = new Map((participations || []).map((p: any) => [p.group_buy_id, p.quantity]));

  const active = (groupBuys || []).filter((gb: any) => !groupBuyState(gb).cancelled);
  const closed = (groupBuys || []).filter((gb: any) => groupBuyState(gb).cancelled);

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
              Join a group buy started by another buyer, or pick a product from the catalog and start your own — then share
              the link to hit the threshold before the deadline.
            </p>
          </div>
          <Link
            to="/shop/group-buys/catalog"
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors"
          >
            <Plus size={14} /> Start a Group Buy
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 bg-secondary animate-pulse" />)}
          </div>
        ) : active.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((gb: any) => (
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
            <p className="mb-3">No active group buys yet.</p>
            <Link to="/shop/group-buys/catalog" className="underline">Browse the group buy catalog</Link>
          </div>
        )}

        {closed.length > 0 && (
          <section className="mt-16">
            <h2 className="font-heading text-xl font-bold mb-4">Closed group buys</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {closed.map((gb: any) => (
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
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
