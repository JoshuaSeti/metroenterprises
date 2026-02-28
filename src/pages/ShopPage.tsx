import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/use-store-data";
import { useSearchParams } from "react-router-dom";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") || undefined;
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();

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
        <p className="text-muted-foreground mb-8">Browse our curated collection</p>

        {/* Category filters */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <a
              href="/shop"
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${!categorySlug ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${categorySlug === cat.slug ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary mb-3" />
                <div className="h-3 bg-secondary w-2/3 mb-2" />
                <div className="h-3 bg-secondary w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                image_url={product.image_url}
                category={(product as any).categories?.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No products found</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
