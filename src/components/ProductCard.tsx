import { Link } from "react-router-dom";

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
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
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
      <h3 className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">{name}</h3>
      <div className="flex items-center gap-2">
        {originalPrice && originalPrice > price ? (
          <>
            <span className="text-sm font-semibold">${price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
          </>
        ) : (
          <span className="text-sm font-semibold">${price.toFixed(2)}</span>
        )}
      </div>
    </Link>
  );
}
