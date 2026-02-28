import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCategories } from "@/hooks/use-store-data";
import { Link } from "react-router-dom";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground mb-8">Browse by category</p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary animate-pulse" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-square bg-secondary overflow-hidden"
              >
                {cat.image_url && (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                )}
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-background">{cat.name}</h3>
                    {cat.description && <p className="text-background/70 text-sm mt-1">{cat.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-muted-foreground">No categories yet</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
