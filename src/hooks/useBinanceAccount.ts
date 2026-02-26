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

interface SignResponse {
  apiKey: string;
  signature: string;
  timestamp: number;
  queryString: string;
}

interface BinanceAccountResponse {
  balances: { asset: string; free: string; locked: string }[];
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
      // Step 1: Get signature from our server
      const signRes = await fetch("/api/binance/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "GET",
          endpoint: "/api/v3/account",
          params: {},
        }),
        signal,
      });

      if (signRes.status === 401) {
        setHasApiKey(false);
        setRawBalances([]);
        setError(null);
        return;
      }

      if (signRes.status === 400) {
        const data = await signRes.json();
        if (data.error?.includes("No Binance API keys")) {
          setHasApiKey(false);
          setRawBalances([]);
          setError(null);
          return;
        }
        throw new Error(data.error);
      }

      if (!signRes.ok) {
        const data = await signRes.json();
        throw new Error(data.error || `Sign failed: HTTP ${signRes.status}`);
      }

      const { apiKey, signature, queryString }: SignResponse = await signRes.json();

      // Step 2: Call Binance directly from client
      const binanceRes = await fetch(
        `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: { "X-MBX-APIKEY": apiKey },
          signal,
        },
      );

      if (!binanceRes.ok) {
        const errData = await binanceRes.json();
        throw new Error(errData.msg || `Binance error: HTTP ${binanceRes.status}`);
      }

      const data: BinanceAccountResponse = await binanceRes.json();

      // Filter out zero balances
      const nonZeroBalances = data.balances.filter((b) => {
        const free = parseFloat(b.free);
        const locked = parseFloat(b.locked);
        return free > 0 || locked > 0;
      });

      setRawBalances(nonZeroBalances);
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
