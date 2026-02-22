"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatCompact } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { TrendingUp } from "lucide-react";

type Period = "daily" | "weekly" | "monthly";

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  performance: {
    daily: DataPoint[];
    weekly: DataPoint[];
    monthly: DataPoint[];
  };
}

function formatAxisDate(dateStr: string, period: Period) {
  const d = new Date(dateStr + "T00:00:00");
  if (period === "monthly") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{formatCurrency(payload[0].value ?? 0)}</p>
    </div>
  );
}

export function PerformanceChart({ performance }: Props) {
  const [period, setPeriod] = useState<Period>("daily");
  const data = performance[period];

  // Thin out x-axis ticks so they don't overlap
  const tickCount = Math.min(data.length, 8);
  const step = Math.max(1, Math.floor(data.length / tickCount));
  const ticks = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => d.date);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Portfolio Value</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No history yet"
            description="Record transactions to see your portfolio performance over time."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                ticks={ticks}
                tickFormatter={(v) => formatAxisDate(v, period)}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
