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

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

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

// ── useOpenOrders ────────────────────────────────────────────────────────────

export function useOpenOrders(symbol?: string) {
  const [state, setState] = useState<FetchState<BinanceOpenOrder[]>>({
    data: null,
    isLoading: false,
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = new URLSearchParams();
      if (symbol) params.set("symbol", symbol);
      const res = await fetch(`/api/binance/orders/open?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as BinanceOpenOrder[];
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch open orders",
      }));
    }
  }, [symbol]);

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  return { ...state, refetch: fetchOrders };
}

// ── useOrderHistory ──────────────────────────────────────────────────────────

export function useOrderHistory(symbol?: string, limit?: number) {
  const [state, setState] = useState<FetchState<BinanceOpenOrder[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchHistory = useCallback(async () => {
    if (!symbol) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = new URLSearchParams({ symbol });
      if (limit) params.set("limit", limit.toString());
      const res = await fetch(`/api/binance/orders/history?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as BinanceOpenOrder[];
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch order history",
      }));
    }
  }, [symbol, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { ...state, refetch: fetchHistory };
}

// ── useTradeHistory ──────────────────────────────────────────────────────────

export function useTradeHistory(symbol?: string, limit?: number) {
  const [state, setState] = useState<FetchState<BinanceTrade[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchTrades = useCallback(async () => {
    if (!symbol) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = new URLSearchParams({ symbol });
      if (limit) params.set("limit", limit.toString());
      const res = await fetch(`/api/binance/trades/history?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as BinanceTrade[];
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch trade history",
      }));
    }
  }, [symbol, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { ...state, refetch: fetchTrades };
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
