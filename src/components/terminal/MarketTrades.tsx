"use client";

import { useMemo } from "react";
import { useBinanceRecentTrades } from "@/hooks/useBinanceMarket";
import { generateMarketTrades } from "./mock-data";

interface MarketTradesProps {
  symbol: string;
  basePrice: number;
  baseAsset: string;
  quoteAsset: string;
}

export function MarketTrades({ symbol, basePrice, baseAsset, quoteAsset }: MarketTradesProps) {
  const { trades: liveTrades, isLoading } = useBinanceRecentTrades(symbol);

  const trades = useMemo(() => {
    if (liveTrades.length > 0) {
      return liveTrades.map((t) => ({
        id: t.id,
        price: parseFloat(t.price),
        amount: parseFloat(t.qty),
        time: new Date(t.time).toLocaleTimeString("en-US", { hour12: false }),
        isBuy: !t.isBuyerMaker,
      }));
    }
    // Fallback to mock data
    return generateMarketTrades(basePrice, 50);
  }, [liveTrades, basePrice]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-300">Market Trades</span>
      </div>

      {/* Column headers */}
      <div className="flex px-3 py-1 text-[10px] text-gray-500 border-b border-gray-800">
        <span className="flex-1">Price({quoteAsset})</span>
        <span className="w-20 text-right">Amount({baseAsset})</span>
        <span className="w-16 text-right">Time</span>
      </div>

      {/* Loading */}
      {isLoading && trades.length === 0 && (
        <div className="flex items-center justify-center py-2">
          <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Trades */}
      <div className="flex-1 overflow-y-auto">
        {trades.map((trade) => (
          <div key={trade.id} className="flex px-3 py-[2px] text-[11px] font-mono hover:bg-gray-800/50">
            <span className={`flex-1 ${trade.isBuy ? "text-green-400" : "text-red-400"}`}>
              {trade.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="w-20 text-right text-gray-300">{trade.amount.toFixed(4)}</span>
            <span className="w-16 text-right text-gray-500">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
