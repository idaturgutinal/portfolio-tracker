"use client";

import { useState, useMemo } from "react";
import { generateOrderBook } from "./mock-data";

interface OrderBookProps {
  basePrice: number;
  baseAsset: string;
  quoteAsset: string;
}

export function OrderBook({ basePrice, baseAsset, quoteAsset }: OrderBookProps) {
  const [precision, setPrecision] = useState(0.01);
  const precisionOptions = [0.01, 0.1, 1, 10];

  const { asks, bids } = useMemo(
    () => generateOrderBook(basePrice, 15, precision),
    [basePrice, precision]
  );

  const maxTotal = Math.max(
    asks.length > 0 ? asks[asks.length - 1].total : 0,
    bids.length > 0 ? bids[bids.length - 1].total : 0
  );

  function formatPrice(price: number): string {
    if (precision >= 1) return price.toFixed(0);
    if (precision >= 0.1) return price.toFixed(1);
    return price.toFixed(2);
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-300">Order Book</span>
        <div className="flex gap-1">
          {precisionOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPrecision(p)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${
                precision === p ? "bg-gray-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex px-3 py-1 text-[10px] text-gray-500 border-b border-gray-800">
        <span className="flex-1">Price({quoteAsset})</span>
        <span className="w-24 text-right">Amount({baseAsset})</span>
        <span className="w-24 text-right">Total</span>
      </div>

      {/* Asks (sells) - reversed so lowest ask is at bottom */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end">
        {[...asks].reverse().map((entry, i) => (
          <div key={`ask-${i}`} className="relative flex px-3 py-[2px] text-[11px] font-mono">
            <div
              className="absolute inset-y-0 right-0 bg-red-500/10"
              style={{ width: `${(entry.total / maxTotal) * 100}%` }}
            />
            <span className="relative flex-1 text-red-400">{formatPrice(entry.price)}</span>
            <span className="relative w-24 text-right text-gray-300">{entry.amount.toFixed(4)}</span>
            <span className="relative w-24 text-right text-gray-400">{entry.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Spread / Last Price */}
      <div className="px-3 py-2 border-y border-gray-700 text-center">
        <span className="text-lg font-bold font-mono text-white">
          {basePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Bids (buys) */}
      <div className="flex-1 overflow-hidden">
        {bids.map((entry, i) => (
          <div key={`bid-${i}`} className="relative flex px-3 py-[2px] text-[11px] font-mono">
            <div
              className="absolute inset-y-0 right-0 bg-green-500/10"
              style={{ width: `${(entry.total / maxTotal) * 100}%` }}
            />
            <span className="relative flex-1 text-green-400">{formatPrice(entry.price)}</span>
            <span className="relative w-24 text-right text-gray-300">{entry.amount.toFixed(4)}</span>
            <span className="relative w-24 text-right text-gray-400">{entry.total.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
