import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories, useAllActiveDiscounts, getProductDiscount } from "@/hooks/use-store-data";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: discounts } = useAllActiveDiscounts();

  const featuredProducts = products?.slice(0, 8) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroCarousel />

        {categories && categories.length > 0 && (
          <section className="container py-16">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-semibold">Shop by Category</h2>
              <Link to="/categories" className="text-sm font-medium uppercase tracking-wide hover:text-primary transition-colors flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group relative aspect-square bg-secondary overflow-hidden">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
                  <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
                  <div className="absolute inset-0 flex items-end p-4">
                    <h3 className="font-heading text-lg font-semibold text-background">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold">Featured</h2>
            <Link to="/shop" className="text-sm font-medium uppercase tracking-wide hover:text-primary transition-colors flex items-center gap-1">
              Shop All <ArrowRight size={14} />
            </Link>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary mb-3" />
                  <div className="h-3 bg-secondary w-2/3 mb-2" />
                  <div className="h-3 bg-secondary w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
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
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">No products yet</p>
              <p className="text-sm">Products will appear here once added by an admin.</p>
            </div>
          )}
        </section>

        <section className="bg-foreground text-background">
          <div className="container py-20 text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">Quality Without Compromise</h2>
            <p className="text-background/70 max-w-md mx-auto mb-8">Every piece is selected with intention. Built to last, designed to endure.</p>
            <Link to="/shop" className="inline-block border border-background text-background px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-background hover:text-foreground transition-colors">Discover More</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
