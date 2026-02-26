import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDividendData } from "@/services/dividend.service";
import { DividendSummaryCards } from "@/components/dividends/dividend-summary-cards";
import { DividendChart } from "@/components/dividends/dividend-chart";
import { DividendByAssetChart } from "@/components/dividends/dividend-by-asset";
import { DividendHistoryTable } from "@/components/dividends/dividend-history-table";
import { PageHeader } from "@/components/page-header";
import { DollarSign } from "lucide-react";

export const metadata = { title: "Dividends — FolioVault" };

export default async function DividendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currency = session.user.defaultCurrency ?? "USD";
  const data = await getDividendData(session.user.id);

  return (
    <main className="container py-8 space-y-6">
      <PageHeader
        icon={DollarSign}
        title="Dividends"
        description="Track your dividend income and payment history."
      />

      <DividendSummaryCards
        totalDividends={data.totalDividends}
        monthlyAverage={data.monthlyAverage}
        last12Months={data.last12Months}
        totalCount={data.totalCount}
        currency={currency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DividendChart monthly={data.monthly} currency={currency} />
        </div>
        <div className="lg:col-span-2">
          <DividendByAssetChart byAsset={data.byAsset} currency={currency} />
        </div>
      </div>

      <DividendHistoryTable transactions={data.transactions} currency={currency} />
    </main>
  );
}
