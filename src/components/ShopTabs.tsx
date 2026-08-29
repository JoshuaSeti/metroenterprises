import { NavLink } from "react-router-dom";

const tabs = [
  { label: "Products", to: "/shop", end: true },
  { label: "Group Buys", to: "/shop/group-buys", end: false },
];

export default function ShopTabs() {
  return (
    <div className="flex gap-6 border-b border-border mb-8">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `pb-3 -mb-px text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
              isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
