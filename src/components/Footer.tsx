import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4">DIRECT-LINK SUPPLIES</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your direct source for phones, laptops, gadgets and trending goods. Sourcing made simple.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Quick Links</h4>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop All</Link>
            <Link to="/categories" className="hover:text-foreground transition-colors">Categories</Link>
            <Link to="/account" className="hover:text-foreground transition-colors">My Account</Link>
            <Link to="/rewards" className="hover:text-foreground transition-colors">Rewards</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          </nav>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Contact</h4>
          <p className="text-sm text-muted-foreground">hello@directlinksupplies.com</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Direct-Link Supplies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
