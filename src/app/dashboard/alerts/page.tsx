import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAlertsByUser } from "@/services/alert.service";
import { getAssetsByUser } from "@/services/portfolio.service";
import { AlertsTable } from "@/components/alerts/alerts-table";
import type { AssetOption, PriceAlertRow } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Bell } from "lucide-react";

export const metadata = { title: "Price Alerts — FolioVault" };

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
      <PageHeader
        icon={Bell}
        title="Price Alerts"
        description="Monitor price thresholds for your assets."
      />
      <AlertsTable initialAlerts={alerts} assetOptions={assetOptions} />
    </main>
  );
}
