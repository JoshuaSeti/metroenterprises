import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProduct } from "@/hooks/use-store-data";
import { useParams } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-secondary" />
            <div>
              <div className="h-6 bg-secondary w-1/3 mb-4" />
              <div className="h-8 bg-secondary w-2/3 mb-4" />
              <div className="h-4 bg-secondary w-1/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
      });
    }
    toast.success(`${product.name} added to cart`);
    setQty(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-secondary overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            {(product as any).categories?.name && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {(product as any).categories.name}
              </p>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold mb-6">${Number(product.price).toFixed(2)}</p>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-secondary transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 text-sm font-medium min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3 hover:bg-secondary transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-foreground text-background px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors w-full md:w-auto"
            >
              Add to Cart
            </button>

            {product.stock_quantity !== null && product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <p className="text-xs text-muted-foreground mt-4">Only {product.stock_quantity} left in stock</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
