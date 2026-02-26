"use client";

import type { CoinPair } from "./mock-data";

interface TerminalHeaderProps {
  selectedPair: CoinPair;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(2) + "B";
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + "M";
  if (vol >= 1_000) return (vol / 1_000).toFixed(2) + "K";
  return vol.toFixed(2);
}

export function TerminalHeader({ selectedPair }: TerminalHeaderProps) {
  const isPositive = selectedPair.change24h >= 0;

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-gray-900 border-b border-gray-700 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold text-white">
          {selectedPair.baseAsset}/{selectedPair.quoteAsset}
        </span>
      </div>

      <div className="shrink-0">
        <span className={`text-xl font-bold font-mono ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {selectedPair.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h Change</span>
        <span className={`text-sm font-mono font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{selectedPair.change24h.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h High</span>
        <span className="text-sm font-mono text-white">
          {selectedPair.high24h.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h Low</span>
        <span className="text-sm font-mono text-white">
          {selectedPair.low24h.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h Volume</span>
        <span className="text-sm font-mono text-white">
          {formatVolume(selectedPair.volume24h)}
        </span>
      </div>
    </div>
  );
}
