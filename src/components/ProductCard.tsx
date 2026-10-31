import { Link } from "react-router-dom";
import { ArrowUpRight, Package } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  category?: string;
  discountLabel?: string;
  originalPrice?: number;
}

export default function ProductCard({ name, slug, price, image_url, category, discountLabel, originalPrice }: ProductCardProps) {
  return (
    <Link to={`/product/${slug}`} className="group block">
      <div className="relative aspect-square bg-card border border-border overflow-hidden mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-muted-foreground text-xs">
            <Package size={32} strokeWidth={1} aria-hidden="true" />
            Image unavailable
          </div>
        )}
        {discountLabel && (
          <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 uppercase tracking-wide">
            {discountLabel}
          </span>
        )}
      </div>
      {category && (
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{category}</p>
      )}
      <h3 className="text-sm font-medium mb-2 group-hover:text-primary transition-colors leading-relaxed">{name}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {originalPrice && originalPrice > price ? (
          <>
            <span className="text-sm font-semibold">K{price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            <span className="text-xs text-muted-foreground line-through">K{originalPrice.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          </>
        ) : (
          <span className="text-sm font-semibold">K{price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        )}
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary">View product <ArrowUpRight size={14} /></span>
    </Link>
  );
}
