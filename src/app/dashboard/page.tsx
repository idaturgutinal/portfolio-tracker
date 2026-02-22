import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboard.service";
import { checkAndFireAlerts } from "@/services/alert.service";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { TopMovers } from "@/components/dashboard/top-movers";
import { AlertNotifier } from "@/components/alerts/alert-notifier";

export const metadata = { title: "Dashboard — Portfolio Tracker" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currency = session.user.defaultCurrency ?? "USD";
  const [data, triggeredAlerts] = await Promise.all([
    getDashboardData(session.user.id, currency),
    checkAndFireAlerts(session.user.id),
  ]);

  return (
    <main className="container py-8 space-y-6">
      <AlertNotifier triggered={triggeredAlerts} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session.user.name}.
        </p>
      </div>

      <SummaryCards
        totalValue={data.totalValue}
        totalCost={data.totalCost}
        totalGainLoss={data.totalGainLoss}
        totalGainLossPct={data.totalGainLossPct}
        currency={currency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PerformanceChart performance={data.performance} />
        </div>
        <div className="lg:col-span-2">
          <AllocationChart
            byType={data.allocationByType}
            byAsset={data.allocationByAsset}
          />
        </div>
      </div>

      <TopMovers
        topGainers={data.topGainers}
        topLosers={data.topLosers}
        pricesStale={data.pricesStale}
        currency={currency}
      />
    </main>
  );
}
