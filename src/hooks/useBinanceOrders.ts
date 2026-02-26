"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  BinanceOpenOrder,
  BinanceTrade,
  BinanceOrderResponse,
  OrderSide,
  OrderType,
} from "@/lib/binance/order-client";

// ── Types ────────────────────────────────────────────────────────────────────

interface MutationState {
  isLoading: boolean;
  error: string | null;
}

interface PlaceOrderInput {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price?: string;
  stopPrice?: string;
}

interface CancelOrderInput {
  symbol: string;
  orderId: number;
}

// ── Shared fetch helper ──────────────────────────────────────────────────────

async function fetchBinanceApi<T>(
  url: string,
  signal: AbortSignal,
  callbacks: {
    onUnauthorized: () => void;
    onError: (msg: string) => void;
    onSuccess: (data: T) => void;
  }
) {
  try {
    const res = await fetch(url, { signal });

    if (res.status === 401) {
      callbacks.onUnauthorized();
      return;
    }

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }

    const data = (await res.json()) as T;
    callbacks.onSuccess(data);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") return;
    callbacks.onError(err instanceof Error ? err.message : "Request failed");
  }
}

// ── useOpenOrders ────────────────────────────────────────────────────────────

export function useOpenOrders(symbol?: string) {
  const [orders, setOrders] = useState<BinanceOpenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(
    async (signal: AbortSignal) => {
      const params = new URLSearchParams();
      if (symbol) params.set("symbol", symbol);
      const qs = params.toString();
      const url = `/api/binance/orders/open${qs ? `?${qs}` : ""}`;

      await fetchBinanceApi<BinanceOpenOrder[]>(url, signal, {
        onUnauthorized: () => {
          setHasApiKey(false);
          setOrders([]);
          setError(null);
          setIsLoading(false);
        },
        onError: (msg) => {
          setError(msg);
          setIsLoading(false);
        },
        onSuccess: (data) => {
          setOrders(data);
          setHasApiKey(true);
          setError(null);
          setIsLoading(false);
        },
      });
    },
    [symbol]
  );

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    fetchOrders(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchOrders(controller.signal);
      }
    }, 15_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const refetch = useCallback(() => {
    if (abortRef.current && !abortRef.current.signal.aborted) {
      fetchOrders(abortRef.current.signal);
    }
  }, [fetchOrders]);

  return { orders, isLoading, error, hasApiKey, refetch };
}

// ── useOrderHistory ──────────────────────────────────────────────────────────

export function useOrderHistory(symbol: string) {
  const [orders, setOrders] = useState<BinanceOpenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchHistory = useCallback(
    async (signal: AbortSignal) => {
      if (!symbol) return;

      const url = `/api/binance/orders/history?symbol=${encodeURIComponent(symbol)}&limit=50`;

      await fetchBinanceApi<BinanceOpenOrder[]>(url, signal, {
        onUnauthorized: () => {
          setHasApiKey(false);
          setOrders([]);
          setError(null);
          setIsLoading(false);
        },
        onError: (msg) => {
          setError(msg);
          setIsLoading(false);
        },
        onSuccess: (data) => {
          setOrders([...data].reverse());
          setHasApiKey(true);
          setError(null);
          setIsLoading(false);
        },
      });
    },
    [symbol]
  );

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    fetchHistory(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchHistory(controller.signal);
      }
    }, 30_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchHistory]);

  return { orders, isLoading, error, hasApiKey };
}

// ── useTradeHistory ──────────────────────────────────────────────────────────

export function useTradeHistory(symbol: string) {
  const [trades, setTrades] = useState<BinanceTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTrades = useCallback(
    async (signal: AbortSignal) => {
      if (!symbol) return;

      const url = `/api/binance/trades/history?symbol=${encodeURIComponent(symbol)}&limit=50`;

      await fetchBinanceApi<BinanceTrade[]>(url, signal, {
        onUnauthorized: () => {
          setHasApiKey(false);
          setTrades([]);
          setError(null);
          setIsLoading(false);
        },
        onError: (msg) => {
          setError(msg);
          setIsLoading(false);
        },
        onSuccess: (data) => {
          setTrades([...data].reverse());
          setHasApiKey(true);
          setError(null);
          setIsLoading(false);
        },
      });
    },
    [symbol]
  );

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    fetchTrades(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchTrades(controller.signal);
      }
    }, 30_000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchTrades]);

  return { trades, isLoading, error, hasApiKey };
}

// ── usePlaceOrder ────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  const placeOrder = useCallback(async (input: PlaceOrderInput): Promise<BinanceOrderResponse | null> => {
    setState({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/binance/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as BinanceOrderResponse;
      setState({ isLoading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      setState({ isLoading: false, error: message });
      return null;
    }
  }, []);

  return { ...state, placeOrder };
}

// ── useCancelOrder ───────────────────────────────────────────────────────────

export function useCancelOrder() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  const cancelOrder = useCallback(async (input: CancelOrderInput): Promise<boolean> => {
    setState({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/binance/order/cancel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      setState({ isLoading: false, error: null });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel order";
      setState({ isLoading: false, error: message });
      return false;
    }
  }, []);

  return { ...state, cancelOrder };
}

// ── useCancelAllOrders ───────────────────────────────────────────────────────

export function useCancelAllOrders() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  const cancelAllOrders = useCallback(async (symbol: string): Promise<boolean> => {
    setState({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/binance/order/cancel-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setState({ isLoading: false, error: null });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel all orders";
      setState({ isLoading: false, error: message });
      return false;
    }
  }, []);

  return { ...state, cancelAllOrders };
}
