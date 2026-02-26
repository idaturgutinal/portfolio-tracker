"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { DollarSign, TrendingUp, BarChart2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  totalDividends: number;
  monthlyAverage: number;
  last12Months: number;
  totalCount: number;
  currency?: string;
}

export function DividendSummaryCards({
  totalDividends,
  monthlyAverage,
  last12Months,
  totalCount,
  currency = "USD",
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Total Dividends"
        value={formatCurrency(totalDividends, currency)}
        icon={DollarSign}
        iconBg="bg-positive/10"
        iconColor="text-positive"
      />
      <MetricCard
        title="Last 12 Months"
        value={formatCurrency(last12Months, currency)}
        icon={TrendingUp}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-500"
      />
      <MetricCard
        title="Monthly Average"
        value={formatCurrency(monthlyAverage, currency)}
        icon={BarChart2}
        iconBg="bg-amber-500/10"
        iconColor="text-amber-500"
      />
      <MetricCard
        title="Total Payments"
        value={totalCount.toString()}
        icon={ArrowUpDown}
        iconBg="bg-purple-500/10"
        iconColor="text-purple-500"
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
