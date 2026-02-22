"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/utils/format";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const gainBg = positive ? "bg-positive/10" : "bg-negative/10";
  const GainIcon = positive ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Portfolio Value"
        value={formatCurrency(totalValue, currency)}
        icon={DollarSign}
      />
      <MetricCard
        title="Total Invested"
        value={formatCurrency(totalCost, currency)}
        icon={BarChart2}
      />
      <MetricCard
        title="Profit / Loss"
        value={(positive ? "+" : "−") + formatCurrency(Math.abs(totalGainLoss), currency)}
        valueClassName={gainColor}
        icon={GainIcon}
        iconClassName={gainColor}
        iconBgClassName={gainBg}
      />
      <MetricCard
        title="Return"
        value={formatPercent(totalGainLossPct)}
        valueClassName={gainColor}
        icon={GainIcon}
        iconClassName={gainColor}
        iconBgClassName={gainBg}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  valueClassName,
  icon: Icon,
  iconClassName,
  iconBgClassName,
}: {
  title: string;
  value: string;
  valueClassName?: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBgClassName ?? "bg-primary/10")}>
          <Icon className={cn("h-4 w-4", iconClassName ?? "text-primary")} />
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueClassName ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
