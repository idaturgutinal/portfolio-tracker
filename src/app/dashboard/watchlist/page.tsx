import { Eye } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function WatchlistPage() {
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Watchlist</h1>
      <EmptyState
        icon={Eye}
        title="Watchlist — Coming Soon"
        description="Track securities you're interested in without adding them to a portfolio."
      />
    </main>
  );
}
