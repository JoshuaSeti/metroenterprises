import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories, useAllActiveDiscounts, getProductDiscount } from "@/hooks/use-store-data";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, PackageSearch, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import sourcingWarehouse from "@/assets/sourcing-warehouse.jpg";

const Index = () => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: discounts } = useAllActiveDiscounts();

  const featuredProducts = products?.slice(0, 8) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-8 md:py-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">Goods sourcing · Business supply · Everyday products</p>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-3">DIRECT-LINK SUPPLIES</h1>
            <p className="text-muted-foreground text-base leading-relaxed">The goods you need. A direct link to source them.<br className="hidden sm:block" /> For your business, your next bulk order, or your everyday needs.</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/b2b">Source a product <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/shop">Browse products</Link></Button>
          </div>
        </section>
        <HeroCarousel />

        <section className="border-y border-border bg-card">
          <div className="container grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { icon: PackageSearch, title: "Product sourcing", text: "A specific item. Your specifications.", to: "/b2b" },
              { icon: Boxes, title: "Business & bulk supply", text: "Goods for your business or resale.", to: "/b2b" },
              { icon: Users, title: "Group buying", text: "Buy together from our group buy catalog.", to: "/shop/group-buys" },
            ].map(({ icon: Icon, title, text, to }) => (
              <Link key={title} to={to} className="flex items-center gap-4 py-6 md:px-6 first:md:pl-0 last:md:pr-0 group">
                <Icon className="text-accent shrink-0" size={26} strokeWidth={1.5} />
                <div className="flex-1"><h2 className="text-sm font-bold mb-1 group-hover:text-accent">{title}</h2><p className="text-xs text-muted-foreground leading-relaxed">{text}</p></div>
                <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {categories && categories.length > 0 && (
          <section className="container pt-12 pb-6">
            <div className="flex flex-wrap gap-4 items-end justify-between mb-6">
              <h2 className="font-heading text-2xl md:text-3xl font-semibold">Explore our catalog</h2>
              <Link to="/categories" className="text-xs font-medium uppercase tracking-wide hover:text-primary transition-colors flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group flex flex-col items-center text-center gap-3 border-r border-b border-border px-4 py-6 bg-card hover:bg-secondary transition-colors">
                  <div className="h-20 w-20 flex items-center justify-center">
                    {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-contain" loading="lazy" /> : <Boxes size={32} strokeWidth={1} className="text-muted-foreground" />}
                  </div>
                  <h3 className="text-xs font-semibold leading-relaxed">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="container py-10 md:py-12">
          <div className="flex flex-wrap gap-4 items-end justify-between mb-8">
            <div><p className="text-xs uppercase tracking-wide text-accent font-semibold mb-2">From our current catalog</p><h2 className="font-heading text-2xl md:text-3xl font-extrabold">Product showcase</h2></div>
            <Link to="/shop" className="text-xs font-medium uppercase tracking-wide hover:text-primary transition-colors flex items-center gap-1">
              All products <ArrowRight size={14} />
            </Link>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary mb-3" />
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
              <p className="text-lg mb-4">No products available right now</p>
              <Button asChild variant="outline"><Link to="/b2b">Make a sourcing inquiry <ArrowRight /></Link></Button>
            </div>
          )}
        </section>

        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <img src={sourcingWarehouse} alt="Illustration of goods sourcing and warehouse packing" width={1536} height={1024} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative container py-16 md:py-20">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wide mb-4">Beyond the catalog</p>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-5">Goods sourcing.<br />Made simple.</h2>
              <p className="text-primary-foreground/90 leading-relaxed mb-8">Looking for something you haven’t found here? From equipment and supplies to consumer goods, bring us your requirements and let’s discuss sourcing your order.</p>
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/b2b">Discuss your sourcing needs <ArrowRight /></Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
