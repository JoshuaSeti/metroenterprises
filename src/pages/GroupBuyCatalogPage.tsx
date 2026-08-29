import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopTabs from "@/components/ShopTabs";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useGroupBuyProducts } from "@/hooks/use-group-buys";
import { useStoreSettings, shippingTimeFor, tierPriceFor } from "@/hooks/use-store-settings";

export default function GroupBuyCatalogPage() {
  const { data: products, isLoading } = useGroupBuyProducts();
  const { data: settings } = useStoreSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Group Buy Catalog</h1>
        <p className="text-muted-foreground mb-6">Pick a product, commit your units and start your own group buy</p>

        <ShopTabs />

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-secondary animate-pulse" />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: any) => {
              const tiers = p.product_price_tiers || [];
              const bestPrice = tiers.length
                ? Math.min(Number(p.price), ...tiers.map((t: any) => Number(t.unit_price)))
                : Number(p.price);
              return (
                <Link
                  key={p.id}
                  to={`/shop/group-buys/product/${p.slug}`}
                  className="border border-border bg-background flex flex-col hover:border-foreground transition-colors"
                >
                  <div className="aspect-[4/3] bg-secondary overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    {p.categories?.name && (
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{p.categories.name}</p>
                    )}
                    <h2 className="font-heading font-bold text-base mb-2">{p.name}</h2>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">${Number(p.price).toFixed(2)}</span>
                      <span className="text-muted-foreground"> / unit</span>
                      {bestPrice < Number(p.price) && (
                        <span className="text-muted-foreground"> · down to ${bestPrice.toFixed(2)} in bulk</span>
                      )}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} /> Threshold {p.group_buy_min_quantity} units
                    </p>
                    {shippingTimeFor(p, settings) && (
                      <p className="text-xs text-muted-foreground mt-1">Ships in {shippingTimeFor(p, settings)}</p>
                    )}
                    <span className="mt-auto pt-4 text-xs uppercase tracking-wide font-semibold">Start a group buy →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No group buy products available yet. Check back soon.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
