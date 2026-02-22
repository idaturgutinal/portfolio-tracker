import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAlertsByUser } from "@/services/alert.service";
import { getAssetsByUser } from "@/services/portfolio.service";
import { AlertsTable } from "@/components/alerts/alerts-table";
import type { AssetOption, PriceAlertRow } from "@/types";

export const metadata = { title: "Price Alerts — Portfolio Tracker" };

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [dbAlerts, dbAssets] = await Promise.all([
    getAlertsByUser(session.user.id),
    getAssetsByUser(session.user.id),
  ]);

  const alerts: PriceAlertRow[] = dbAlerts.map((a) => ({
    id: a.id,
    assetId: a.assetId,
    symbol: a.symbol,
    assetName: a.asset.name,
    condition: a.condition as "ABOVE" | "BELOW",
    targetPrice: a.targetPrice,
    active: a.active,
    triggeredAt: a.triggeredAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  const assetOptions: AssetOption[] = dbAssets.map((a) => ({
    id: a.id,
    symbol: a.symbol,
    name: a.name,
    portfolioName: a.portfolio.name,
  }));

  return (
    <main className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Price Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Monitor price thresholds for your assets.
        </p>
      </div>
      <AlertsTable initialAlerts={alerts} assetOptions={assetOptions} />
    </main>
  );
}
