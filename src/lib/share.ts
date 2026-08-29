import { toast } from "sonner";

export function groupBuyUrl(gb: { id: string; share_slug?: string | null }) {
  return `${window.location.origin}/group-buy/${gb.share_slug || gb.id}`;
}

export async function shareGroupBuy(gb: { id: string; title?: string; share_slug?: string | null }) {
  const url = groupBuyUrl(gb);
  try {
    if (navigator.share) {
      await navigator.share({ title: gb.title || "Join my group buy", url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  } catch (e: any) {
    if (e?.name === "AbortError") return;
    toast.error("Could not share this group buy");
  }
}
