import { Users, Clock } from "lucide-react";

interface Props {
  groupBuy: any;
  joined?: number;
  onJoin: () => void;
  onLeave: () => void;
  busy?: boolean;
}

export default function GroupBuyCard({ groupBuy, joined, onJoin, onLeave, busy }: Props) {
  const committed = Number(groupBuy.committed_quantity || 0);
  const min = Math.max(1, Number(groupBuy.min_quantity || 1));
  const pct = Math.min(100, Math.round((committed / min) * 100));
  const reached = committed >= min;
  const image = groupBuy.image_url || groupBuy.products?.image_url;
  const deadline = groupBuy.deadline ? new Date(groupBuy.deadline) : null;
  const expired = deadline ? deadline < new Date() : false;

  return (
    <article className="border border-border bg-background flex flex-col">
      <div className="aspect-[4/3] bg-secondary overflow-hidden">
        {image ? (
          <img src={image} alt={groupBuy.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-base mb-1">{groupBuy.title}</h3>
        {groupBuy.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{groupBuy.description}</p>
        )}

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">${Number(groupBuy.unit_price).toFixed(2)} <span className="text-muted-foreground font-normal">/ unit</span></span>
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Users size={14} /> {committed} / {min}
          </span>
        </div>

        <div className="h-2 w-full bg-secondary mb-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full transition-all ${reached ? "bg-primary" : "bg-foreground"}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {reached ? "Threshold reached — order confirmed" : `${min - committed} more units to unlock this price`}
        </p>

        {deadline && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Clock size={12} /> {expired ? "Closed" : `Closes ${deadline.toLocaleDateString()}`}
          </p>
        )}

        <div className="mt-auto flex gap-2">
          {joined ? (
            <>
              <span className="flex-1 text-xs uppercase tracking-wide font-semibold border border-border px-3 py-2 text-center">
                Joined · {joined} units
              </span>
              <button onClick={onLeave} disabled={busy} className="text-xs uppercase tracking-wide font-semibold px-3 py-2 border border-border hover:border-foreground transition-colors disabled:opacity-50">
                Leave
              </button>
            </>
          ) : (
            <button
              onClick={onJoin}
              disabled={busy || expired || groupBuy.status !== "open"}
              className="flex-1 bg-foreground text-background text-xs uppercase tracking-wide font-semibold px-3 py-2 hover:bg-primary transition-colors disabled:opacity-50"
            >
              {expired || groupBuy.status !== "open" ? "Closed" : "Join Group Buy"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
