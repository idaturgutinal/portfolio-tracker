"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Bell } from "lucide-react";
import type { CoinPair } from "./mock-data";
import { toast } from "@/hooks/use-toast";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  const checkFavorite = useCallback(async () => {
    try {
      const res = await fetch("/api/binance/favorites");
      if (res.ok) {
        const data = (await res.json()) as { symbol: string }[];
        setIsFavorite(data.some((f) => f.symbol === selectedPair.symbol));
      }
    } catch {
      // ignore
    }
  }, [selectedPair.symbol]);

  const checkAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/binance/alerts");
      if (res.ok) {
        const data = (await res.json()) as { symbol: string; isActive: boolean }[];
        setHasAlert(data.some((a) => a.symbol === selectedPair.symbol && a.isActive));
      }
    } catch {
      // ignore
    }
  }, [selectedPair.symbol]);

  useEffect(() => {
    checkFavorite();
    checkAlerts();
  }, [checkFavorite, checkAlerts]);

  const toggleFavorite = async () => {
    const prev = isFavorite;
    setIsFavorite(!prev);

    try {
      if (prev) {
        const res = await fetch("/api/binance/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: selectedPair.symbol }),
        });
        if (!res.ok && res.status !== 204) {
          setIsFavorite(prev);
          toast({ title: "Error", description: "Failed to remove favorite.", variant: "destructive" });
        }
      } else {
        const res = await fetch("/api/binance/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: selectedPair.symbol }),
        });
        if (!res.ok) {
          setIsFavorite(prev);
          toast({ title: "Error", description: "Failed to add favorite.", variant: "destructive" });
        }
      }
    } catch {
      setIsFavorite(prev);
    }
  };

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-gray-900 border-b border-gray-700 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold text-white">
          {selectedPair.baseAsset}/{selectedPair.quoteAsset}
        </span>
        <button onClick={toggleFavorite} className="shrink-0" aria-label="Toggle favorite">
          <Star className={`h-4 w-4 transition-colors ${isFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-500 hover:text-yellow-500"}`} />
        </button>
        {hasAlert && (
          <span title="Active alert for this pair">
            <Bell className="h-4 w-4 text-yellow-500 shrink-0" />
          </span>
        )}
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
