import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, categories] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total"),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);
      const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const orderCount = orders.data?.length || 0;
      const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;
      return {
        productCount: products.count || 0,
        orderCount,
        totalRevenue,
        avgOrder,
        categoryCount: categories.count || 0,
      };
    },
  });

  const cards = [
    { label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign },
    { label: "Orders", value: stats?.orderCount || 0, icon: ShoppingCart },
    { label: "Avg Order Value", value: `$${(stats?.avgOrder || 0).toFixed(2)}`, icon: TrendingUp },
    { label: "Products", value: stats?.productCount || 0, icon: Package },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-border p-6">
            <Icon size={20} className="text-muted-foreground mb-3" />
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
