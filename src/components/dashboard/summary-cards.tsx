"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/utils/format";
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";

interface Props {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  /** Decimal fraction: 0.05 = +5% */
  totalGainLossPct: number;
  currency?: string;
}

export function SummaryCards({
  totalValue,
  totalCost,
  totalGainLoss,
  totalGainLossPct,
  currency = "USD",
}: Props) {
  const positive = totalGainLoss >= 0;
  const gainColor = positive ? "text-positive" : "text-negative";
  const GainIcon = positive ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Portfolio Value"
        value={formatCurrency(totalValue, currency)}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Total Invested"
        value={formatCurrency(totalCost, currency)}
        icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Profit / Loss"
        value={(positive ? "+" : "−") + formatCurrency(Math.abs(totalGainLoss), currency)}
        valueClassName={gainColor}
        icon={<GainIcon className={`h-4 w-4 ${gainColor}`} />}
      />
      <MetricCard
        title="Return"
        value={formatPercent(totalGainLossPct)}
        valueClassName={gainColor}
        icon={<GainIcon className={`h-4 w-4 ${gainColor}`} />}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  valueClassName,
  icon,
}: {
  title: string;
  value: string;
  valueClassName?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueClassName ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
