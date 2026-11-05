import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ShopTabs from "@/components/ShopTabs";
import { useProducts, useCategories, useAllActiveDiscounts, getProductDiscount } from "@/hooks/use-store-data";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Boxes } from "lucide-react";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || undefined;
  const subSlug = searchParams.get("sub") || undefined;
  const { data: products, isLoading } = useProducts();
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: discounts } = useAllActiveDiscounts();

  const all = (categories || []) as any[];
  const mainCats = all.filter((c) => !c.parent_id);
  const selected = all.find((c) => c.slug === categorySlug);
  // If a subcategory slug was passed as category, treat its parent as the main one
  const main = selected?.parent_id ? all.find((c) => c.id === selected.parent_id) : selected;
  const activeSub = selected?.parent_id ? selected.slug : subSlug;
  const subs = main ? all.filter((c) => c.parent_id === main.id) : [];
  const allowedIds = main
    ? activeSub
      ? all.filter((c) => c.slug === activeSub).map((c) => c.id)
      : [main.id, ...subs.map((s) => s.id)]
    : [];
  const filtered = main ? products?.filter((p: any) => allowedIds.includes(p.category_id)) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{main ? main.name : "Shop"}</h1>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
          <p className="text-muted-foreground">{main ? "Browse products in this category." : "Choose a category to browse, or source goods to your requirements."}</p>
          <Button asChild variant="outline" className="self-start shrink-0"><Link to="/b2b">Source a product <ArrowRight /></Link></Button>
        </div>

        <ShopTabs />

        {!main ? (
          catsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] bg-secondary animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainCats.map((cat) => {
                const count = all.filter((c) => c.parent_id === cat.id).length;
                return (
                  <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group relative aspect-[4/3] bg-card border border-border overflow-hidden flex flex-col justify-end hover:border-primary transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center p-10">
                      {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <Boxes size={64} strokeWidth={1} className="text-muted-foreground" />}
                    </div>
                    <div className="relative bg-background/90 border-t border-border p-4 flex items-center justify-between">
                      <div>
                        <h2 className="font-heading text-lg font-bold">{cat.name}</h2>
                        {count > 0 && <p className="text-xs text-muted-foreground">{count} subcategories</p>}
                      </div>
                      <ArrowRight size={18} className="group-hover:text-primary" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <>
            <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-border pb-4 mb-8">
              <Link to="/shop" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">← All categories</Link>
              {subs.length > 0 && (
                <>
                  <Link to={`/shop?category=${main.slug}`} className={`text-xs font-semibold uppercase tracking-wide ${!activeSub ? "text-accent underline underline-offset-8" : "text-muted-foreground hover:text-foreground"}`}>All {main.name}</Link>
                  {subs.map((s) => (
                    <Link key={s.id} to={`/shop?category=${main.slug}&sub=${s.slug}`} className={`text-xs font-semibold uppercase tracking-wide ${activeSub === s.slug ? "text-accent underline underline-offset-8" : "text-muted-foreground hover:text-foreground"}`}>{s.name}</Link>
                  ))}
                </>
              )}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-secondary animate-pulse" />)}
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filtered.map((product: any) => {
                  const price = Number(product.price);
                  const { finalPrice, label } = getProductDiscount(product.id, product.category_id, price, discounts || []);
                  return (
                    <ProductCard key={product.id} id={product.id} name={product.name} slug={product.slug} price={finalPrice}
                      originalPrice={finalPrice < price ? price : undefined} discountLabel={label || undefined}
                      image_url={product.image_url} category={product.categories?.name} />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground"><p>No products found</p></div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
