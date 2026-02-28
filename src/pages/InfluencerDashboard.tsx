import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart3, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default function InfluencerDashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || userRole !== "influencer")) navigate("/");
  }, [user, userRole, loading, navigate]);

  const { data } = useQuery({
    queryKey: ["influencer-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: codes } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("influencer_id", user.id);

      if (!codes || codes.length === 0) return { codes: [], orders: [], totalRevenue: 0, totalUses: 0 };

      const codeIds = codes.map((c) => c.id);
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, created_at")
        .in("promo_code_id", codeIds)
        .order("created_at", { ascending: false });

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const totalUses = codes.reduce((sum, c) => sum + (c.usage_count || 0), 0);

      return { codes, orders: orders || [], totalRevenue, totalUses };
    },
    enabled: !!user,
  });

  if (loading || !user || userRole !== "influencer") return null;

  const stats = [
    { label: "Total Uses", value: data?.totalUses || 0, icon: BarChart3 },
    { label: "Orders Generated", value: data?.orders.length || 0, icon: ShoppingCart },
    { label: "Revenue Generated", value: `$${(data?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign },
    { label: "Conversion Rate", value: data?.totalUses ? `${((data.orders.length / data.totalUses) * 100).toFixed(1)}%` : "0%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Influencer Dashboard</h1>
        <p className="text-muted-foreground mb-8">Track your promo code performance</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border border-border p-6">
              <Icon size={20} className="text-muted-foreground mb-3" />
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        {data?.codes && data.codes.length > 0 && (
          <div className="mb-12">
            <h2 className="font-heading text-xl font-semibold mb-4">Your Codes</h2>
            <div className="border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Uses</th>
                  </tr>
                </thead>
                <tbody>
                  {data.codes.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                      <td className="px-4 py-3">{c.usage_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <h2 className="font-heading text-xl font-semibold mb-4">Recent Orders</h2>
        {data?.orders && data.orders.length > 0 ? (
          <div className="border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order ID</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">${Number(o.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No orders yet</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
