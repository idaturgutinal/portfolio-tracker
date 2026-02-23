"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent, formatCurrency } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { BarChart2 } from "lucide-react";
import type { AssetMetric } from "@/services/dashboard.service";

interface Props {
  assets: AssetMetric[];
  currency?: string;
}

interface TooltipEntry extends AssetMetric {
  pnlPct: number;
}

function PnlTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TooltipEntry;
  const positive = d.gainLoss >= 0;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm space-y-1">
      <p className="font-semibold font-mono">{d.symbol}</p>
      <p className="text-xs text-muted-foreground">{d.name}</p>
      <p className={positive ? "text-positive" : "text-negative"}>
        {formatPercent(d.gainLossPct)}
      </p>
      <p className="text-muted-foreground text-xs">
        P&amp;L: {positive ? "+" : ""}
        {formatCurrency(d.gainLoss)}
      </p>
    </div>
  );
}

export function PnlBarChart({ assets }: Props) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Return by Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart2}
            title="No assets"
            description="Add assets to your portfolios to see P&L breakdown."
          />
        </CardContent>
      </Card>
    );
  }

  const sorted = [...assets].sort((a, b) => b.gainLossPct - a.gainLossPct);
  const data: TooltipEntry[] = sorted.map((a) => ({
    ...a,
    pnlPct: +(a.gainLossPct * 100).toFixed(2),
  }));

  const barHeight = 36;
  const chartHeight = Math.max(180, data.length * barHeight + 48);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return by Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 52, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              className="stroke-muted"
            />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="symbol"
              width={56}
              tick={{
                fontSize: 11,
                fill: "hsl(var(--foreground))",
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<PnlTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
            />
            <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1} />
            <Bar dataKey="pnlPct" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.gainLossPct >= 0 ? "#10b981" : "#ef4444"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
