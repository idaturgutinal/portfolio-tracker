import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTransactionsByUser } from "@/services/transaction.service";
import { getAssetsByUser } from "@/services/portfolio.service";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import type { AssetOption, EnrichedTransaction } from "@/types";

export const metadata = { title: "Transactions — Portfolio Tracker" };

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currency = session.user.defaultCurrency ?? "USD";

  const [dbTransactions, dbAssets] = await Promise.all([
    getTransactionsByUser(session.user.id),
    getAssetsByUser(session.user.id),
  ]);

  const enrichedTransactions: EnrichedTransaction[] = dbTransactions.map((t) => ({
    id: t.id,
    type: t.type,
    quantity: t.quantity,
    pricePerUnit: t.pricePerUnit,
    fees: t.fees,
    total:
      t.type === "BUY"
        ? t.quantity * t.pricePerUnit + t.fees
        : t.quantity * t.pricePerUnit - t.fees,
    date: t.date.toISOString(),
    notes: t.notes,
    assetId: t.assetId,
    assetSymbol: t.asset.symbol,
    assetName: t.asset.name,
    portfolioId: t.asset.portfolioId,
    portfolioName: t.asset.portfolio.name,
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
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Full transaction history across all portfolios.
        </p>
      </div>
      <TransactionsTable
        initialTransactions={enrichedTransactions}
        assetOptions={assetOptions}
        currency={currency}
      />
    </main>
  );
}
