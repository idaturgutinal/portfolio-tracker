"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BinanceTrade } from "@/lib/binance/order-client";

type DateRange = "1d" | "7d" | "30d" | "all";

interface TradeHistoryTableProps {
  trades: BinanceTrade[];
  isLoading: boolean;
  symbol?: string;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function calcTotal(trade: BinanceTrade): string {
  const quoteQty = parseFloat(trade.quoteQty);
  if (quoteQty > 0) return quoteQty.toFixed(8);
  return (parseFloat(trade.price) * parseFloat(trade.qty)).toFixed(8);
}

function filterByDateRange(trades: BinanceTrade[], range: DateRange): BinanceTrade[] {
  if (range === "all") return trades;

  const now = Date.now();
  const msMap: Record<Exclude<DateRange, "all">, number> = {
    "1d": 86400000,
    "7d": 604800000,
    "30d": 2592000000,
  };

  const cutoff = now - msMap[range];
  return trades.filter((t) => t.time >= cutoff);
}

function handleExport(symbol: string | undefined) {
  if (!symbol) return;
  window.open(`/api/binance/export/trades?symbol=${symbol}`, "_blank");
}

export function TradeHistoryTable({
  trades,
  isLoading,
  symbol,
}: TradeHistoryTableProps) {
  const [dateRange, setDateRange] = useState<DateRange>("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        Loading trade history...
      </div>
    );
  }

  const filteredTrades = filterByDateRange(trades || [], dateRange);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["1d", "7d", "30d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
              className="h-7 px-2 text-xs"
            >
              {range === "all" ? "All" : range.toUpperCase()}
            </Button>
          ))}
        </div>
        {symbol && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(symbol)}
            className="h-7 px-3 text-xs"
          >
            Export CSV
          </Button>
        )}
      </div>

      {filteredTrades.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No trades found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2 font-medium">Date</th>
                <th className="text-left py-2 px-2 font-medium">Pair</th>
                <th className="text-left py-2 px-2 font-medium">Side</th>
                <th className="text-right py-2 px-2 font-medium">Price</th>
                <th className="text-right py-2 px-2 font-medium">Quantity</th>
                <th className="text-right py-2 px-2 font-medium">Commission</th>
                <th className="text-left py-2 px-2 font-medium">Comm. Asset</th>
                <th className="text-right py-2 px-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-2 whitespace-nowrap">
                    {formatDate(trade.time)}
                  </td>
                  <td className="py-2 px-2 font-medium">{trade.symbol}</td>
                  <td
                    className={`py-2 px-2 font-medium ${
                      trade.isBuyer ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trade.isBuyer ? "BUY" : "SELL"}
                  </td>
                  <td className="py-2 px-2 text-right">{trade.price}</td>
                  <td className="py-2 px-2 text-right">{trade.qty}</td>
                  <td className="py-2 px-2 text-right">{trade.commission}</td>
                  <td className="py-2 px-2">{trade.commissionAsset}</td>
                  <td className="py-2 px-2 text-right">{calcTotal(trade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
