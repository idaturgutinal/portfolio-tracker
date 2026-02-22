import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function AnalyticsPage() {
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Analytics</h1>
      <EmptyState
        icon={BarChart2}
        title="Analytics — Coming Soon"
        description="Deep-dive charts, return attribution, and portfolio benchmarking are on the way."
      />
    </main>
  );
}
