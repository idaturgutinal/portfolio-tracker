"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Bell, TrendingUp, TrendingDown } from "lucide-react";
import type { CoinPair } from "./mock-data";
import type { TickerData } from "@/hooks/useBinanceMarket";
import { toast } from "@/hooks/use-toast";

interface TerminalHeaderProps {
  selectedPair: CoinPair;
  liveTicker?: TickerData;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(2) + "B";
  if (vol >= 1_000_000) return (vol / 1_000_000).toFixed(2) + "M";
  if (vol >= 1_000) return (vol / 1_000).toFixed(2) + "K";
  return vol.toFixed(2);
}

export function TerminalHeader({ selectedPair, liveTicker }: TerminalHeaderProps) {
  const price = liveTicker?.lastPrice ?? selectedPair.price;
  const change = liveTicker?.priceChangePercent ?? selectedPair.change24h;
  const high = liveTicker?.highPrice ?? selectedPair.high24h;
  const low = liveTicker?.lowPrice ?? selectedPair.low24h;
  const volume = liveTicker?.quoteVolume ?? selectedPair.volume24h;

  const isPositive = change >= 0;
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);
  const prevPriceRef = useRef<number>(price);

  // Track price direction for animation
  useEffect(() => {
    if (prevPriceRef.current !== price) {
      setPriceDirection(price > prevPriceRef.current ? "up" : "down");
      prevPriceRef.current = price;
      const timeout = setTimeout(() => setPriceDirection(null), 600);
      return () => clearTimeout(timeout);
    }
  }, [price]);

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

      <div className="flex items-center gap-1 shrink-0">
        <span className={`text-xl font-bold font-mono transition-colors duration-300 ${
          priceDirection === "up" ? "text-green-400" :
          priceDirection === "down" ? "text-red-400" :
          isPositive ? "text-green-500" : "text-red-500"
        }`}>
          {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {priceDirection === "up" && <TrendingUp className="h-4 w-4 text-green-400 animate-bounce" />}
        {priceDirection === "down" && <TrendingDown className="h-4 w-4 text-red-400 animate-bounce" />}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h Change</span>
        <span className={`text-sm font-mono font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{change.toFixed(2)}%
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h High</span>
        <span className="text-sm font-mono text-white">
          {high.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h Low</span>
        <span className="text-sm font-mono text-white">
          {low.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400">24h Volume</span>
        <span className="text-sm font-mono text-white">
          {formatVolume(volume)}
        </span>
      </div>
    </div>
  );
}
