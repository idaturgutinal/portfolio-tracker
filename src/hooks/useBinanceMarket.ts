"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// Types
// ============================================================

export interface TickerData {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
  highPrice: number;
  lowPrice: number;
  quoteVolume: number;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DepthEntry {
  price: string;
  qty: string;
}

export interface DepthData {
  bids: [string, string][];
  asks: [string, string][];
}

export interface TradeData {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
}

// ============================================================
// Binance API raw response types
// ============================================================

interface BinanceTickerRaw {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

type BinanceKlineRaw = [
  number,   // open time
  string,   // open
  string,   // high
  string,   // low
  string,   // close
  string,   // volume
  number,   // close time
  string,   // quote asset volume
  number,   // number of trades
  string,   // taker buy base asset volume
  string,   // taker buy quote asset volume
  string,   // ignore
];

interface BinanceDepthRaw {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface BinanceTradeRaw {
  id: number;
  price: string;
  qty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

// ============================================================
// A) useBinanceTickers
// ============================================================

export function useBinanceTickers() {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTickers = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: BinanceTickerRaw[] = await res.json();

      const map = new Map<string, TickerData>();
      for (const t of data) {
        if (t.symbol.endsWith("USDT") || t.symbol.endsWith("BTC") || t.symbol.endsWith("BNB")) {
          map.set(t.symbol, {
            symbol: t.symbol,
            lastPrice: parseFloat(t.lastPrice),
            priceChangePercent: parseFloat(t.priceChangePercent),
            volume: parseFloat(t.volume),
            highPrice: parseFloat(t.highPrice),
            lowPrice: parseFloat(t.lowPrice),
            quoteVolume: parseFloat(t.quoteVolume),
          });
        }
      }
      setTickers(map);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch tickers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetchTickers(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchTickers(controller.signal);
      }
    }, 5000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchTickers]);

  return { tickers, isLoading, error };
}

// ============================================================
// B) useBinanceKlines
// ============================================================

export function useBinanceKlines(symbol: string, interval: string) {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const controller = new AbortController();
    setIsLoading(true);

    const fetchKlines = async () => {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BinanceKlineRaw[] = await res.json();

        const parsed: KlineData[] = data.map((k) => ({
          time: Math.floor(k[0] / 1000),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));

        setKlines(parsed);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to fetch klines");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKlines();

    return () => {
      controller.abort();
    };
  }, [symbol, interval]);

  return { klines, isLoading, error };
}

// ============================================================
// C) useBinanceDepth
// ============================================================

export function useBinanceDepth(symbol: string) {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    const controller = new AbortController();

    const fetchDepth = async () => {
      try {
        const url = `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BinanceDepthRaw = await res.json();

        setBids(data.bids);
        setAsks(data.asks);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepth();

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchDepth();
      }
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [symbol]);

  return { bids, asks, isLoading };
}

// ============================================================
// D) useBinanceRecentTrades
// ============================================================

export function useBinanceRecentTrades(symbol: string) {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    const controller = new AbortController();

    const fetchTrades = async () => {
      try {
        const url = `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=50`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BinanceTradeRaw[] = await res.json();

        const parsed: TradeData[] = data.map((t) => ({
          id: t.id,
          price: t.price,
          qty: t.qty,
          time: t.time,
          isBuyerMaker: t.isBuyerMaker,
        }));

        setTrades(parsed.reverse());
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchTrades();
      }
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [symbol]);

  return { trades, isLoading };
}
