"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

type Mode = "type" | "asset";

interface TypeSlice {
  type: string;
  value: number;
  pct: number;
}

interface AssetSlice {
  symbol: string;
  name: string;
  value: number;
  pct: number;
}

interface Props {
  byType: TypeSlice[];
  byAsset: AssetSlice[];
}

function AllocationTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm space-y-0.5">
      <p className="font-medium">{d.name}</p>
      <p>{formatCurrency(d.value ?? 0)}</p>
      <p className="text-muted-foreground">
        {formatPercent((d.payload as { pct: number }).pct)}
      </p>
    </div>
  );
}

export function AllocationChart({ byType, byAsset }: Props) {
  const [mode, setMode] = useState<Mode>("type");

  const data =
    mode === "type"
      ? byType.map((d) => ({ name: d.type, value: d.value, pct: d.pct }))
      : byAsset.map((d) => ({ name: d.symbol, value: d.value, pct: d.pct }));

  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Allocation</CardTitle>
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="type">By Type</TabsTrigger>
            <TabsTrigger value="asset">By Asset</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title="No assets yet"
            description="Add assets to your portfolios to see allocation breakdowns."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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
              <Tooltip content={<AllocationTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
