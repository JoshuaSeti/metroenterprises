import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/signin");
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const handleMoveToCart = (item: any) => {
    addItem({
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      image_url: item.products.image_url,
    });
    removeFromWishlist.mutate(item.product_id);
    toast.success("Moved to cart!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">My Wishlist</h1>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
            <Link
              to="/shop"
              className="inline-block border border-foreground px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item: any) => (
              <div key={item.id} className="border border-border group">
                <Link to={`/product/${item.products.slug}`} className="block">
                  <div className="aspect-square bg-secondary overflow-hidden">
                    {item.products.image_url && (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${item.products.slug}`}>
                    <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">{item.products.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-3">${Number(item.products.price).toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        removeFromWishlist.mutate(item.product_id);
                        toast.success("Removed from wishlist");
                      }}
                      className="border border-border p-2 hover:border-destructive hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
