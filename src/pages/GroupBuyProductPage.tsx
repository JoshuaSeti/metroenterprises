import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GroupBuyCard from "@/components/GroupBuyCard";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Truck, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useGroupBuyProduct,
  useGroupBuysForProduct,
  useStartGroupBuy,
  useJoinGroupBuy,
  useLeaveGroupBuy,
  useMyParticipations,
} from "@/hooks/use-group-buys";
import { useStoreSettings, shippingTimeFor, tierPriceFor } from "@/hooks/use-store-settings";

export default function GroupBuyProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: product, isLoading } = useGroupBuyProduct(slug);
  const { data: groupBuys } = useGroupBuysForProduct(product?.id);
  const { data: settings } = useStoreSettings();
  const { data: participations } = useMyParticipations();
  const start = useStartGroupBuy();
  const join = useJoinGroupBuy();
  const leave = useLeaveGroupBuy();

  const [qty, setQty] = useState("10");

  const joinedMap = new Map((participations || []).map((p: any) => [p.group_buy_id, p.quantity]));
  const tiers = [...(product?.product_price_tiers || [])].sort(
    (a: any, b: any) => Number(a.min_quantity) - Number(b.min_quantity)
  );

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to start a group buy");
      return navigate("/signin");
    }
    const quantity = Math.max(1, parseInt(qty, 10) || 0);
    start.mutate(
      { product, quantity, deadlineDays: Number(settings?.group_buy_default_days || 14) },
      {
        onSuccess: (gb: any) => {
          toast.success("Group buy created — share it to reach the threshold");
          navigate(`/group-buy/${gb.share_slug || gb.id}`);
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  const handleJoin = (id: string) => {
    if (!user) {
      toast.error("Sign in to join a group buy");
      return navigate("/signin");
    }
    const input = window.prompt("How many units do you want to commit?", "1");
    if (!input) return;
    const quantity = parseInt(input, 10);
    if (!quantity || quantity < 1) return toast.error("Enter a valid quantity");
    join.mutate({ groupBuyId: id, quantity }, {
      onSuccess: () => toast.success("You joined the group buy"),
      onError: (e: any) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12"><div className="h-96 bg-secondary animate-pulse" /></main>
        <Footer />
      </div>
    );
  }

  if (!product || !product.is_group_buy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 text-center text-muted-foreground">
          <p className="mb-4">This product isn't available for group buys.</p>
          <Link to="/shop/group-buys/catalog" className="underline">Back to the group buy catalog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const minQty = Math.max(1, Number(product.group_buy_min_quantity || 10));
  const projectedPrice = tierPriceFor(Number(product.price), tiers as any, Math.max(minQty, parseInt(qty, 10) || 0));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <Link to="/shop/group-buys/catalog" className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">← Group buy catalog</Link>

        <div className="grid md:grid-cols-2 gap-12 mt-6">
          <div className="aspect-square bg-secondary overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>

          <div>
            {product.categories?.name && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.categories.name}</p>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold mb-4">${Number(product.price).toFixed(2)} <span className="text-sm text-muted-foreground font-normal">/ unit at minimum order</span></p>

            {product.description && <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>}

            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-center gap-2"><Users size={14} /> Group buy threshold: {minQty} units</li>
              {shippingTimeFor(product, settings) && (
                <li className="flex items-center gap-2"><Truck size={14} /> Shipping time: {shippingTimeFor(product, settings)}</li>
              )}
              <li className="flex items-center gap-2"><Clock size={14} /> Group buys run for {settings?.group_buy_default_days || 14} days</li>
            </ul>

            {tiers.length > 0 && (
              <div className="border border-border mb-6">
                <p className="px-4 py-2 text-xs uppercase tracking-wide font-semibold border-b border-border">Bulk pricing</p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-2">{minQty}+ units</td>
                      <td className="px-4 py-2 text-right font-medium">${Number(product.price).toFixed(2)} / unit</td>
                    </tr>
                    {tiers.map((t: any) => (
                      <tr key={t.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2">{t.min_quantity}+ units</td>
                        <td className="px-4 py-2 text-right font-medium">${Number(t.unit_price).toFixed(2)} / unit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form onSubmit={handleStart} className="border border-border p-4">
              <p className="font-heading font-bold mb-1">Start your own group buy</p>
              <p className="text-xs text-muted-foreground mb-4">
                Commit your units, then share the link. If the threshold isn't met by the deadline, the group buy is cancelled or you can transfer your units to another group buy.
              </p>
              <label className="text-xs uppercase tracking-wide font-semibold">Units you're committing</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-sm mb-3"
              />
              <p className="text-xs text-muted-foreground mb-4">
                Projected unit price once the threshold is met: <span className="font-semibold text-foreground">${projectedPrice.toFixed(2)}</span>
              </p>
              <button
                type="submit"
                disabled={start.isPending}
                className="w-full bg-foreground text-background px-5 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors disabled:opacity-50"
              >
                {start.isPending ? "Creating..." : "Create Group Buy"}
              </button>
            </form>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Active group buys for this product</h2>
          {groupBuys && groupBuys.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupBuys.map((gb: any) => (
                <GroupBuyCard
                  key={gb.id}
                  groupBuy={gb}
                  joined={joinedMap.get(gb.id)}
                  onJoin={() => handleJoin(gb.id)}
                  onLeave={() => leave.mutate(gb.id, { onSuccess: () => toast.success("You left the group buy") })}
                  busy={join.isPending || leave.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No one has started a group buy for this product yet — be the first.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
