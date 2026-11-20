import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useValidatePromoCode } from "@/hooks/use-store-data";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBilaAvailability, usePrepareBila } from "@/hooks/use-bila";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [address, setAddress] = useState("");
  const validatePromo = useValidatePromoCode();
  const navigate = useNavigate();
  const { data: bila, isLoading: bilaLoading } = useBilaAvailability();
  const prepareBila = usePrepareBila();
  const [checkoutToken] = useState(() => crypto.randomUUID());

  const discountAmount = appliedPromo
    ? appliedPromo.type === "percentage"
      ? total * (Number(appliedPromo.value) / 100)
      : appliedPromo.type === "fixed_amount"
        ? Number(appliedPromo.value)
        : 0
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    validatePromo.mutate(promoCode, {
      onSuccess: (data) => {
        setAppliedPromo(data);
        toast.success("Promo code applied!");
      },
      onError: (err: any) => {
        toast.error(err.message);
      },
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    if (!bila?.available || prepareBila.isPending) {
      toast.error("Bila checkout is currently unavailable. Please try again later.");
      return;
    }
      prepareBila.mutate({ checkoutToken, address, promoCodeId: appliedPromo?.id ?? null,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity })),
      }, {
        onSuccess: () => {
          clearCart();
          toast.success("Order saved. Confirm the final amount and pay in your account.");
          navigate("/account");
        },
        onError: error => toast.error(error.message),
      });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some items to get started.</p>
          <Link
            to="/shop"
            className="inline-block bg-foreground text-background px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">Cart</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-0">
            <div className="border-b border-border pb-2 mb-0 hidden sm:grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Product</span>
              <span className="w-24 text-center">Qty</span>
              <span className="w-20 text-right">Price</span>
              <span className="w-8" />
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 sm:gap-4 items-center py-4 border-b border-border">
                <div className="col-span-3 sm:col-span-1 flex min-w-0 items-center gap-4">
                  <div className="w-16 h-16 bg-secondary flex-shrink-0 overflow-hidden">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <span className="min-w-0 break-words text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center border border-border w-24">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-secondary"><Minus size={14} /></button>
                  <span className="flex-1 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-secondary"><Plus size={14} /></button>
                </div>
                <span className="w-20 text-right text-sm font-medium">K{(item.price * item.quantity).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                <button onClick={() => removeItem(item.id)} className="w-8 flex justify-center hover:text-destructive transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="min-w-0 border border-border p-6 h-fit">
            <h2 className="font-heading text-lg font-semibold mb-6">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wide block mb-2">Promo Code</label>
              <div className="flex">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-foreground text-background px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary transition-colors"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <p className="text-xs text-primary mt-2 font-medium">
                  ✓ {appliedPromo.code} applied — {appliedPromo.type === "percentage" ? `${appliedPromo.value}% off` : appliedPromo.type === "free_shipping" ? "Free shipping" : `K${Number(appliedPromo.value).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} off`}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wide block mb-2">Shipping Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Enter your full address"
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>K{total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-K{discountAmount.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>K{finalTotal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
              </div>
            </div>

            <p className="border-t border-border pt-4 mt-4 text-sm">Payment: Bila mobile money</p>
            {!bilaLoading && !bila?.available && <p role="alert" className="text-sm text-destructive mt-2">Bila checkout is currently unavailable. Please try again later.</p>}
            <Button
              onClick={handleCheckout}
              disabled={!bila?.available || prepareBila.isPending}
              className="w-full mt-6 rounded-none h-auto bg-foreground text-background py-4 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              {prepareBila.isPending ? "Placing Order..." : bilaLoading ? "Checking payment availability..." : "Place Order"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Confirm your final amount and pay with Bila in your account after placing your order.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
