import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard, Package, Tag, TicketPercent, Megaphone, Image, ShoppingCart, MessageSquare, Users, LogOut } from "lucide-react";
import metroLogo from "@/assets/metro-logo.png";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Categories", path: "/admin/categories", icon: Tag },
  { label: "Discounts", path: "/admin/discounts", icon: TicketPercent },
  { label: "Promo Codes", path: "/admin/promo-codes", icon: TicketPercent },
  { label: "Campaigns", path: "/admin/campaigns", icon: Megaphone },
  { label: "Carousel", path: "/admin/carousel", icon: Image },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Support", path: "/admin/support", icon: MessageSquare },
  { label: "Users", path: "/admin/users", icon: Users },
];

export default function AdminLayout() {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      navigate("/");
    }
  }, [user, userRole, loading, navigate]);

  if (loading || !user || userRole !== "admin") return null;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-border bg-background flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="block">
            <img src={metroLogo} alt="Metro Enterprises" className="h-8" />
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${location.pathname === path ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
