import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";
import { useMyRewards, useRewardsSettings, useRewardsTiers, getTierForPoints, pointsToCurrency } from "@/hooks/use-rewards";

export default function RewardsPage() {
  const { user } = useAuth();
  const { data: settings } = useRewardsSettings();
  const { data: tiers } = useRewardsTiers();
  const { data: rewards } = useMyRewards();

  const balance = rewards?.balance || 0;
  const { current, next } = getTierForPoints(balance, tiers || []);
  const value = pointsToCurrency(balance, settings);

  if (settings && !settings.is_enabled) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-2">Rewards</h1>
          <p className="text-muted-foreground">Our rewards program is currently unavailable. Check back soon.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="flex items-center gap-3 mb-2">
          <Gift size={24} />
          <h1 className="font-heading text-3xl font-bold">{settings?.program_name || "Rewards"}</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-10">
          Earn {settings?.points_per_currency ?? 1} point per K1 spent. Redeem {settings?.points_per_currency_redeem ?? 100} points for K1 off.
        </p>

        {user ? (
          <div className="border border-border p-8 mb-12">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Your balance</p>
            <p className="font-heading text-4xl font-bold">{balance} pts</p>
            <p className="text-sm text-muted-foreground mt-1">Worth K{value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
            {current && (
              <p className="text-sm mt-4">
                Current tier: <span className="font-semibold" style={{ color: current.color }}>{current.name}</span>
              </p>
            )}
            {next && (
              <p className="text-xs text-muted-foreground mt-1">
                {next.min_points - balance} more points to reach {next.name}
              </p>
            )}
            {settings && balance < settings.min_redeem_points && (
              <p className="text-xs text-muted-foreground mt-3">
                Minimum {settings.min_redeem_points} points required to redeem.
              </p>
            )}
          </div>
        ) : (
          <div className="border border-border p-8 mb-12">
            <p className="text-sm mb-4">Sign in to start earning points on every order.</p>
            <Link to="/signin" className="inline-block bg-primary text-primary-foreground px-6 py-2 text-xs font-semibold uppercase tracking-wide">
              Sign In
            </Link>
          </div>
        )}

        <h2 className="font-heading text-xl font-semibold mb-4">Tiers</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {(tiers || []).map((t) => (
            <div key={t.id} className="border border-border p-6">
              <span className="block w-8 h-1 mb-4" style={{ backgroundColor: t.color }} />
              <h3 className="font-heading text-lg font-semibold">{t.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t.min_points}+ points · {t.multiplier}× earning</p>
              {t.perks && <p className="text-sm text-muted-foreground mt-3">{t.perks}</p>}
            </div>
          ))}
        </div>

        {user && rewards && rewards.transactions.length > 0 && (
          <>
            <h2 className="font-heading text-xl font-semibold mb-4">Points History</h2>
            <div className="border border-border divide-y divide-border">
              {rewards.transactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium capitalize">{String(t.reason).replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}{t.note ? ` · ${t.note}` : ""}
                    </p>
                  </div>
                  <span className={`font-semibold ${t.points >= 0 ? "text-success" : "text-destructive"}`}>
                    {t.points >= 0 ? "+" : ""}{t.points}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {settings?.terms && (
          <p className="text-xs text-muted-foreground mt-10 max-w-2xl leading-relaxed">{settings.terms}</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
