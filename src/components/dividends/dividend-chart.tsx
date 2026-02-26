"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { BarChart2 } from "lucide-react";
import type { DividendMonthly } from "@/services/dividend.service";

interface Props {
  monthly: DividendMonthly[];
  currency?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm space-y-0.5">
      <p className="font-medium">{label}</p>
      <p className="text-positive">{formatCurrency(payload[0].value as number)}</p>
    </div>
  );
}

export function DividendChart({ monthly, currency = "USD" }: Props) {
  if (monthly.length === 0) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
        <CardHeader>
          <CardTitle>Monthly Dividends</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart2}
            title="No dividends yet"
            description="Record dividend transactions to see your monthly dividend income."
          />
        </CardContent>
      </Card>
    );
  }

  // Show last 12 months max
  const data = monthly.slice(-12).map((d) => ({
    month: d.month,
    label: formatMonthLabel(d.month),
    total: d.total,
  }));

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
      <CardHeader>
        <CardTitle>Monthly Dividends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v, currency).replace(/\.00$/, "")}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
}
