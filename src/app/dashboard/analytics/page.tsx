import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboard.service";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { PnlBarChart } from "@/components/analytics/pnl-bar-chart";
import { AssetBreakdownTable } from "@/components/analytics/asset-breakdown-table";
import { PageHeader } from "@/components/page-header";
import { BarChart2 } from "lucide-react";

export const metadata = { title: "Analytics — FolioVault" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currency = session.user.defaultCurrency ?? "USD";
  const data = await getDashboardData(session.user.id, currency);

  return (
    <main className="container py-8 space-y-6">
      <PageHeader
        icon={BarChart2}
        title="Analytics"
        description="Deep-dive into your portfolio performance and allocation."
      />

      <SummaryCards
        totalValue={data.totalValue}
        totalCost={data.totalCost}
        totalGainLoss={data.totalGainLoss}
        totalGainLossPct={data.totalGainLossPct}
        currency={currency}
      />

      <PerformanceChart performance={data.performance} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart
          byType={data.allocationByType}
          byAsset={data.allocationByAsset}
        />
        <PnlBarChart assets={data.allAssets} currency={currency} />
      </div>

      <AssetBreakdownTable assets={data.allAssets} currency={currency} />
    </main>
  );
}
