"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/utils/format";
import type { AssetMetric } from "@/services/dashboard.service";

interface Props {
  topGainers: AssetMetric[];
  topLosers: AssetMetric[];
  pricesStale?: boolean;
  currency?: string;
}

export function TopMovers({ topGainers, topLosers, pricesStale, currency = "USD" }: Props) {
  return (
    <div className="space-y-2">
      {pricesStale && (
        <p className="text-xs text-muted-foreground">
          ⚠ Some prices could not be fetched — showing last cached or cost-basis values.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoverCard title="Top Gainers" assets={topGainers} variant="positive" currency={currency} />
        <MoverCard title="Top Losers" assets={topLosers} variant="negative" currency={currency} />
      </div>
    </div>
  );
}

function MoverCard({
  title,
  assets,
  variant,
  currency = "USD",
}: {
  title: string;
  assets: AssetMetric[];
  variant: "positive" | "negative";
  currency?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <span>No data to display yet.</span>
          </div>
        ) : (
          <ul className="space-y-3">
            {assets.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm truncate">{a.symbol}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {a.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-medium">
                    {formatCurrency(a.value, currency)}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      variant === "positive"
                        ? "text-positive border-positive/30"
                        : "text-negative border-negative/30"
                    }
                  >
                    {formatPercent(a.gainLossPct)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
