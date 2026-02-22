import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWatchlistByUser } from "@/services/watchlist.service";
import { getBatchQuotes, toMarketSymbol } from "@/services/marketData";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import type { WatchlistRow } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Eye } from "lucide-react";

export const metadata = { title: "Watchlist — FolioVault" };

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbItems = await getWatchlistByUser(session.user.id);

  const marketSymbols = dbItems.map((item) =>
    toMarketSymbol(item.symbol, item.assetType)
  );

  const quotes =
    dbItems.length > 0
      ? await getBatchQuotes(marketSymbols)
      : new Map<string, null>();

  const items: WatchlistRow[] = dbItems.map((item, i) => {
    const mSym = marketSymbols[i].toUpperCase();
    const quote = quotes.get(mSym) ?? null;
    return {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      assetType: item.assetType,
      notes: item.notes,
      addedAt: item.addedAt.toISOString(),
      currentPrice: quote?.price ?? null,
      change: quote?.change ?? null,
      changePercent: quote?.changePercent ?? null,
      currency: quote?.currency ?? "USD",
    };
  });

  return (
    <main className="container py-8 space-y-6">
      <PageHeader
        icon={Eye}
        title="Watchlist"
        description="Track securities you're interested in without adding them to a portfolio."
      />
      <WatchlistTable initialItems={items} />
    </main>
  );
}