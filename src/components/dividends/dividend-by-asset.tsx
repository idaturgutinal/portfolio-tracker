"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { PieChart as PieChartIcon } from "lucide-react";
import type { DividendByAsset } from "@/services/dividend.service";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
  "#ef4444",
];

interface Props {
  byAsset: DividendByAsset[];
  currency?: string;
}

function AssetTooltip({ active, payload, currency }: TooltipProps<number, string> & { currency: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { name: string; value: number; pct: number; count: number };
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm space-y-0.5">
      <p className="font-semibold font-mono">{d.name}</p>
      <p className="text-positive">{formatCurrency(d.value, currency)}</p>
      <p className="text-muted-foreground">{formatPercent(d.pct, false)}</p>
      <p className="text-muted-foreground text-xs">{d.count} payment{d.count !== 1 ? "s" : ""}</p>
    </div>
  );
}

export function DividendByAssetChart({ byAsset, currency = "USD" }: Props) {
  if (byAsset.length === 0) {
    return (
      <Card className="h-full shadow-md hover:shadow-lg transition-shadow border-border/60">
        <CardHeader>
          <CardTitle>Dividends by Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={PieChartIcon}
            title="No dividends yet"
            description="Record dividend transactions to see breakdown by asset."
          />
        </CardContent>
      </Card>
    );
  }

  const data = byAsset.map((d) => ({
    name: d.symbol,
    value: d.total,
    pct: d.pct,
    count: d.count,
  }));

  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow border-border/60">
      <CardHeader>
        <CardTitle>Dividends by Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              outerRadius={90}
              dataKey="value"
              nameKey="name"
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<AssetTooltip currency={currency} />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
