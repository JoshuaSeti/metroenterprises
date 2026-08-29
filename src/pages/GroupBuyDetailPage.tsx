import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Clock, Truck, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  groupBuyState,
  useJoinGroupBuy,
  useLeaveGroupBuy,
  useMyParticipations,
  useGroupBuysForProduct,
  useTransferParticipation,
} from "@/hooks/use-group-buys";
import { useStoreSettings, shippingTimeFor, tierPriceFor, nextTier } from "@/hooks/use-store-settings";
import { shareGroupBuy } from "@/lib/share";

const SELECT = "*, products(id, name, slug, image_url, price, shipping_time, product_price_tiers(*))";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function GroupBuyDetailPage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: settings } = useStoreSettings();
  const { data: participations } = useMyParticipations();
  const join = useJoinGroupBuy();
  const leave = useLeaveGroupBuy();
  const transfer = useTransferParticipation();

  const { data: gb, isLoading } = useQuery({
    queryKey: ["group-buy", key],
    queryFn: async () => {
      const column = UUID.test(key!) ? "id" : "share_slug";
      const { data, error } = await supabase.from("group_buys").select(SELECT).eq(column, key!).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!key,
  });

  const { data: alternatives } = useGroupBuysForProduct(gb?.product_id || undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12"><div className="h-96 bg-secondary animate-pulse" /></main>
        <Footer />
      </div>
    );
  }

  if (!gb) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 text-center text-muted-foreground">
          <p className="mb-4">This group buy no longer exists.</p>
          <Link to="/shop/group-buys" className="underline">See active group buys</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { committed, min, reached, deadline, cancelled } = groupBuyState(gb);
  const pct = Math.min(100, Math.round((committed / min) * 100));
  const image = gb.image_url || gb.products?.image_url;
  const tiers = gb.products?.product_price_tiers || [];
  const currentPrice = tierPriceFor(Number(gb.unit_price), tiers, committed);
  const upcoming = nextTier(tiers, committed);
  const myQty = (participations || []).find((p: any) => p.group_buy_id === gb.id)?.quantity;

  const requireAuth = () => {
    if (!user) {
      toast.error("Sign in to take part in group buys");
      navigate("/signin");
      return false;
    }
    return true;
  };

  const handleJoin = () => {
    if (!requireAuth()) return;
    const input = window.prompt("How many units do you want to commit?", "1");
    if (!input) return;
    const quantity = parseInt(input, 10);
    if (!quantity || quantity < 1) return toast.error("Enter a valid quantity");
    join.mutate({ groupBuyId: gb.id, quantity }, {
      onSuccess: () => toast.success("You joined the group buy"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  const handleTransfer = (toId: string) => {
    if (!myQty) return;
    transfer.mutate(
      { fromGroupBuyId: gb.id, toGroupBuyId: toId, quantity: myQty },
      {
        onSuccess: () => {
          toast.success("Your units were transferred");
          navigate(`/group-buy/${toId}`);
        },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const transferOptions = (alternatives || []).filter((a: any) => a.id !== gb.id && groupBuyState(a).open);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <Link to="/shop/group-buys" className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">← All group buys</Link>

        <div className="grid md:grid-cols-2 gap-12 mt-6">
          <div className="aspect-square bg-secondary overflow-hidden">
            {image ? (
              <img src={image} alt={gb.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>

          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">{gb.title}</h1>
            <p className="text-2xl font-semibold mb-4">
              ${currentPrice.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">/ unit</span>
            </p>
            {gb.description && <p className="text-muted-foreground leading-relaxed mb-6">{gb.description}</p>}

            <div className="h-3 w-full bg-secondary mb-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full transition-all ${reached ? "bg-primary" : "bg-foreground"}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-sm mb-6">
              <span className="font-semibold">{committed} / {min} units</span>{" "}
              <span className="text-muted-foreground">
                {cancelled ? "· deadline passed, threshold not met" : reached ? "· threshold reached" : `· ${min - committed} to go`}
              </span>
            </p>

            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-center gap-2"><Users size={14} /> Minimum {min} units to confirm this order</li>
              {deadline && (
                <li className="flex items-center gap-2"><Clock size={14} /> {cancelled ? "Closed" : `Closes ${deadline.toLocaleDateString()}`}</li>
              )}
              {shippingTimeFor(gb.products, settings) && (
                <li className="flex items-center gap-2"><Truck size={14} /> Shipping time: {shippingTimeFor(gb.products, settings)}</li>
              )}
              {upcoming && (
                <li>Reach {upcoming.min_quantity} units to drop the price to ${Number(upcoming.unit_price).toFixed(2)} / unit</li>
              )}
            </ul>

            <div className="flex flex-wrap gap-3">
              {myQty ? (
                <>
                  <span className="border border-border px-4 py-3 text-xs uppercase tracking-wide font-semibold">Joined · {myQty} units</span>
                  <button
                    onClick={() => leave.mutate(gb.id, { onSuccess: () => toast.success("You left the group buy") })}
                    className="border border-border px-4 py-3 text-xs uppercase tracking-wide font-semibold hover:border-foreground transition-colors"
                  >
                    Leave
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={cancelled || gb.status !== "open"}
                  className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-wide font-semibold hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {cancelled || gb.status !== "open" ? "Closed" : "Join this group buy"}
                </button>
              )}
              <button
                onClick={() => shareGroupBuy(gb)}
                className="flex items-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-wide font-semibold hover:border-foreground transition-colors"
              >
                <Share2 size={14} /> Share
              </button>
            </div>

            {gb.products?.slug && (
              <p className="text-xs text-muted-foreground mt-4">
                <Link to={`/shop/group-buys/product/${gb.products.slug}`} className="underline">View product details & bulk pricing</Link>
              </p>
            )}
          </div>
        </div>

        {cancelled && myQty && (
          <section className="mt-16 border border-border p-6">
            <h2 className="font-heading text-xl font-bold mb-2">This group buy was cancelled</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The threshold wasn't reached before the deadline. Transfer your {myQty} units to another open group buy for the same product, or leave to cancel your commitment.
            </p>
            {transferOptions.length > 0 ? (
              <div className="space-y-3">
                {transferOptions.map((a: any) => {
                  const s = groupBuyState(a);
                  return (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{s.committed}/{s.min} units · closes {s.deadline?.toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleTransfer(a.id)}
                        disabled={transfer.isPending}
                        className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-wide font-semibold hover:bg-primary transition-colors disabled:opacity-50"
                      >
                        Transfer here
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No other open group buys for this product right now.{" "}
                {gb.products?.slug && <Link to={`/shop/group-buys/product/${gb.products.slug}`} className="underline">Start a new one</Link>}
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
