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
          setTrades(data);
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

// ── Sign helper (server signs, client sends to Binance) ─────────────────────

interface SignResponse {
  apiKey: string;
  signature: string;
  timestamp: number;
  queryString: string;
}

async function signRequest(
  method: "GET" | "POST" | "DELETE",
  endpoint: string,
  params: Record<string, string>,
): Promise<SignResponse> {
  const res = await fetch("/api/binance/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, endpoint, params, isTrading: true }),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? `Sign request failed (HTTP ${res.status})`);
  }
  return (await res.json()) as SignResponse;
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
      // Build params for signing
      const params: Record<string, string> = {
        symbol: input.symbol,
        side: input.side,
        type: input.type,
        quantity: input.quantity,
      };
      if ((input.type === "LIMIT" || input.type === "STOP_LOSS_LIMIT") && input.price) {
        params.timeInForce = "GTC";
        params.price = input.price;
      }
      if (input.type === "STOP_LOSS_LIMIT" && input.stopPrice) {
        params.stopPrice = input.stopPrice;
      }

      // 1) Server-side signing
      const signed = await signRequest("POST", "/api/v3/order", params);

      // 2) Client-side POST to Binance
      const binanceRes = await fetch("https://api.binance.com/api/v3/order", {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": signed.apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `${signed.queryString}&signature=${signed.signature}`,
      });

      const data = await binanceRes.json();

      if (!binanceRes.ok) {
        throw new Error(
          `Binance error (${data.code ?? binanceRes.status}): ${data.msg ?? "Order failed"}`
        );
      }

      setState({ isLoading: false, error: null });
      return data as BinanceOrderResponse;
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
      // 1) Server-side signing
      const signed = await signRequest("DELETE", "/api/v3/order", {
        symbol: input.symbol,
        orderId: String(input.orderId),
      });

      // 2) Client-side DELETE to Binance
      const binanceRes = await fetch(
        `https://api.binance.com/api/v3/order?${signed.queryString}&signature=${signed.signature}`,
        {
          method: "DELETE",
          headers: { "X-MBX-APIKEY": signed.apiKey },
        }
      );

      const data = await binanceRes.json();

      if (!binanceRes.ok) {
        throw new Error(
          `Binance error (${data.code ?? binanceRes.status}): ${data.msg ?? "Cancel failed"}`
        );
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
