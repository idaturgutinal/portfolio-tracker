"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/utils/format";

const TYPE_LABELS: Record<string, string> = {
  STOCK: "Stock",
  CRYPTO: "Crypto",
  ETF: "ETF",
  MUTUAL_FUND: "Mutual Fund",
  BOND: "Bond",
};

const TYPE_BADGE: Record<string, string> = {
  STOCK: "bg-blue-100 text-blue-700",
  CRYPTO: "bg-orange-100 text-orange-700",
  ETF: "bg-green-100 text-green-700",
  MUTUAL_FUND: "bg-purple-100 text-purple-700",
  BOND: "bg-gray-100 text-gray-600",
};

interface Props {
  symbol: string;
  name: string;
  assetType: string;
  portfolioName: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number | null;
  marketValue: number;
  pnl: number;
  pnlPct: number;
}

export function HoldingsSummaryCard({
  symbol,
  name,
  assetType,
  portfolioName,
  quantity,
  averageBuyPrice,
  currentPrice,
  marketValue,
  pnl,
  pnlPct,
}: Props) {
  const positive = pnl >= 0;
  const pnlClass = positive ? "text-positive" : "text-negative";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Holdings Summary
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[assetType] ?? "bg-muted text-muted-foreground"}`}
          >
            {TYPE_LABELS[assetType] ?? assetType}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Symbol" value={symbol} mono />
        <Row label="Name" value={name} />
        <Row label="Portfolio" value={portfolioName} />
        <div className="border-t my-2" />
        <Row label="Quantity" value={String(quantity)} mono />
        <Row label="Avg Buy Price" value={formatCurrency(averageBuyPrice)} mono />
        <Row
          label="Current Price"
          value={currentPrice != null ? formatCurrency(currentPrice) : "—"}
          mono
        />
        <div className="border-t my-2" />
        <Row label="Market Value" value={formatCurrency(marketValue)} mono />
        <Row
          label="P&L"
          value={`${positive ? "+" : ""}${formatCurrency(pnl)}`}
          mono
          className={pnlClass}
        />
        <Row
          label="P&L %"
          value={formatPercent(pnlPct)}
          mono
          className={pnlClass}
        />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${className ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
