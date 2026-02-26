"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { TickerData } from "./useBinanceMarket";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BalanceItem {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdtValue: number;
}

interface AccountApiResponse {
  balances: { asset: string; free: string; locked: string }[];
  error?: string;
}

interface ErrorResponse {
  error: string;
}

// Stablecoins pegged to ~1 USDT
const STABLECOIN_SET = new Set(["USDT", "USDC", "BUSD", "TUSD", "FDUSD", "DAI"]);

function getUsdtValue(asset: string, total: number, tickers: Map<string, TickerData>): number {
  if (total === 0) return 0;
  if (STABLECOIN_SET.has(asset)) return total;

  // Try direct ASSET/USDT pair
  const directTicker = tickers.get(`${asset}USDT`);
  if (directTicker) return total * directTicker.lastPrice;

  // Try via BTC: ASSET → BTC → USDT
  const btcTicker = tickers.get(`${asset}BTC`);
  const btcUsdtTicker = tickers.get("BTCUSDT");
  if (btcTicker && btcUsdtTicker) {
    return total * btcTicker.lastPrice * btcUsdtTicker.lastPrice;
  }

  // Try via BNB: ASSET → BNB → USDT
  const bnbTicker = tickers.get(`${asset}BNB`);
  const bnbUsdtTicker = tickers.get("BNBUSDT");
  if (bnbTicker && bnbUsdtTicker) {
    return total * bnbTicker.lastPrice * bnbUsdtTicker.lastPrice;
  }

  return 0;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBinanceBalances(tickers: Map<string, TickerData>) {
  const [rawBalances, setRawBalances] = useState<{ asset: string; free: string; locked: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBalances = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch("/api/binance/account", { signal });

      if (res.status === 401) {
        setHasApiKey(false);
        setRawBalances([]);
        setError(null);
        return;
      }

      if (res.status === 400) {
        const data: ErrorResponse = await res.json();
        if (data.error?.includes("No Binance API keys")) {
          setHasApiKey(false);
          setRawBalances([]);
          setError(null);
          return;
        }
        throw new Error(data.error);
      }

      if (!res.ok) {
        const data: ErrorResponse = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data: AccountApiResponse = await res.json();
      setRawBalances(data.balances);
      setHasApiKey(true);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetchBalances(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchBalances(controller.signal);
      }
    }, 30_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchBalances]);

  // Compute enriched balances with USDT values using tickers
  const balances: BalanceItem[] = useMemo(() => {
    return rawBalances.map((b) => {
      const free = parseFloat(b.free);
      const locked = parseFloat(b.locked);
      const total = free + locked;
      const usdtValue = getUsdtValue(b.asset, total, tickers);
      return { asset: b.asset, free, locked, total, usdtValue };
    }).sort((a, b) => b.usdtValue - a.usdtValue);
  }, [rawBalances, tickers]);

  return { balances, isLoading, error, hasApiKey };
}
