import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/message/KL5LBJBA4S6RM1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@direct_link?_r=1&_t=ZN-9BfFAV1xwWM",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/19yKeXaK4p/?mibextid=wwXIfr",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4">DIRECT-LINK SUPPLIES</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Goods sourcing for businesses, resellers and everyday buyers. From a single product to a bulk order — sourcing made simple.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Quick Links</h4>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/b2b" className="hover:text-foreground transition-colors">Source a Product</Link>
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
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                {icon}
                <span>{label}</span>
              </a>
            ))}
          </div>
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
