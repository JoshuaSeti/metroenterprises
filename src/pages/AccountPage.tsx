import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useUserOrders } from "@/hooks/use-store-data";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LogOut, Package, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccountPage() {
  const { user, userRole, signOut, loading } = useAuth();
  const { data: orders } = useUserOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-warning text-warning-foreground",
    confirmed: "bg-primary text-primary-foreground",
    processing: "bg-primary text-primary-foreground",
    shipped: "bg-primary text-primary-foreground",
    delivered: "bg-success text-success-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {userRole === "admin" && (
              <Link to="/admin" className="border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary transition-colors">
                Admin Dashboard
              </Link>
            )}
            {userRole === "influencer" && (
              <Link to="/influencer" className="border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-secondary transition-colors">
                Influencer Dashboard
              </Link>
            )}
            <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Link to="/account" className="border border-border p-6 hover:border-foreground transition-colors">
            <Package size={20} className="mb-3" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Orders</h3>
            <p className="text-muted-foreground text-xs mt-1">{orders?.length || 0} orders</p>
          </Link>
          <Link to="/support" className="border border-border p-6 hover:border-foreground transition-colors">
            <MessageSquare size={20} className="mb-3" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Support</h3>
            <p className="text-muted-foreground text-xs mt-1">Get help with your orders</p>
          </Link>
        </div>

        <h2 className="font-heading text-xl font-semibold mb-4">Order History</h2>
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 font-semibold uppercase tracking-wide ${statusColors[order.status] || ""}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
                {order.order_items && (
                  <div className="space-y-2">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 bg-secondary flex-shrink-0 overflow-hidden">
                          {item.products?.image_url && (
                            <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span>{item.products?.name}</span>
                        <span className="text-muted-foreground">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No orders yet</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
