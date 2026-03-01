import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import metroLogo from "@/assets/metro-logo.png";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, userRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src={metroLogo} alt="Metro Enterprises" className="h-10" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to={userRole === "admin" ? "/admin" : userRole === "influencer" ? "/influencer" : "/account"} className="hover:text-primary transition-colors">
              <User size={20} />
            </Link>
          ) : (
            <Link to="/auth" className="text-sm font-medium tracking-wide uppercase hover:text-primary transition-colors">
              Sign In
            </Link>
          )}
          <Link to="/cart" className="relative hover:text-primary transition-colors">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container py-4 flex flex-col gap-4 text-sm font-medium tracking-wide uppercase">
            <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
            {user && userRole === "admin" && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
