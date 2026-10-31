import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ShopTabs from "@/components/ShopTabs";
import { useProducts, useCategories, useAllActiveDiscounts, getProductDiscount } from "@/hooks/use-store-data";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || undefined;
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: discounts } = useAllActiveDiscounts();

  const filtered = categorySlug
    ? products?.filter((p: any) => p.categories?.slug === categorySlug)
    : products;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          {categorySlug ? categories?.find((c) => c.slug === categorySlug)?.name || "Shop" : "Shop All"}
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">
          <p className="text-muted-foreground">Explore our product catalog, or source goods to your requirements.</p>
          <Button asChild variant="outline" className="self-start shrink-0"><Link to="/b2b">Source a product <ArrowRight /></Link></Button>
        </div>

        <ShopTabs />

        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-border pb-4 mb-8">
            <Link to="/shop" className={`text-xs font-semibold uppercase tracking-wide transition-colors ${!categorySlug ? "text-accent underline underline-offset-8" : "text-muted-foreground hover:text-foreground"}`}>All products</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className={`text-xs font-semibold uppercase tracking-wide transition-colors ${categorySlug === cat.slug ? "text-accent underline underline-offset-8" : "text-muted-foreground hover:text-foreground"}`}>{cat.name}</Link>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-secondary mb-3" />
                <div className="h-3 bg-secondary w-2/3 mb-2" />
                <div className="h-3 bg-secondary w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const price = Number(product.price);
              const { finalPrice, label } = getProductDiscount(product.id, product.category_id, price, discounts || []);
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={finalPrice}
                  originalPrice={finalPrice < price ? price : undefined}
                  discountLabel={label || undefined}
                  image_url={product.image_url}
                  category={(product as any).categories?.name}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground"><p>No products found</p></div>
        )}
      </main>
      <Footer />
    </div>
  );
}
