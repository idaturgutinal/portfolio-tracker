import crypto from "crypto";

const BINANCE_BASE_URL = "https://api.binance.com";

// ── Types ────────────────────────────────────────────────────────────────────

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOP_LOSS_LIMIT";
export type TimeInForce = "GTC" | "IOC" | "FOK";

export interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: TimeInForce;
}

export interface PlaceOcoOrderParams {
  symbol: string;
  side: OrderSide;
  quantity: string;
  price: string;
  stopPrice: string;
  stopLimitPrice: string;
  stopLimitTimeInForce?: TimeInForce;
}

export interface CancelOrderParams {
  symbol: string;
  orderId: number;
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  fills?: BinanceFill[];
}

export interface BinanceFill {
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  tradeId: number;
}

export interface BinanceOpenOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}

export interface BinanceTrade {
  symbol: string;
  id: number;
  orderId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

export interface ExchangeInfoResponse {
  symbols: ExchangeSymbolInfo[];
}

export interface ExchangeSymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  filters: SymbolFilter[];
}

export type SymbolFilter =
  | { filterType: "PRICE_FILTER"; minPrice: string; maxPrice: string; tickSize: string }
  | { filterType: "LOT_SIZE"; minQty: string; maxQty: string; stepSize: string }
  | { filterType: "MIN_NOTIONAL"; minNotional: string }
  | { filterType: "NOTIONAL"; minNotional: string }
  | { filterType: string; [key: string]: string };

export interface BinanceOcoResponse {
  orderListId: number;
  contingencyType: string;
  listStatusType: string;
  listOrderStatus: string;
  listClientOrderId: string;
  transactionTime: number;
  symbol: string;
  orders: Array<{ symbol: string; orderId: number; clientOrderId: string }>;
  orderReports: BinanceOrderResponse[];
}

export interface BinanceApiError {
  code: number;
  msg: string;
}

// ── Client ───────────────────────────────────────────────────────────────────

export class BinanceOrderClient {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(queryString)
      .digest("hex");
  }

  private async signedRequest<T>(
    method: "GET" | "POST" | "DELETE",
    endpoint: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        filtered[key] = String(value);
      }
    }
    filtered.timestamp = Date.now().toString();

    const queryString = new URLSearchParams(filtered).toString();
    const signature = this.createSignature(queryString);
    const signedQuery = `${queryString}&signature=${signature}`;

    const url =
      method === "GET" || method === "DELETE"
        ? `${BINANCE_BASE_URL}${endpoint}?${signedQuery}`
        : `${BINANCE_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      "X-MBX-APIKEY": this.apiKey,
    };

    const fetchOptions: RequestInit = { method, headers };

    if (method === "POST") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      fetchOptions.body = signedQuery;
    }

    const response = await fetch(url, fetchOptions);
    const data: T | BinanceApiError = await response.json();

    if (!response.ok) {
      const error = data as BinanceApiError;
      throw new Error(
        `Binance API error (${error.code}): ${error.msg}`
      );
    }

    return data as T;
  }

  async placeOrder(params: PlaceOrderParams): Promise<BinanceOrderResponse> {
    try {
      const requestParams: Record<string, string | number | undefined> = {
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        quantity: params.quantity,
      };

      if (params.type === "LIMIT" || params.type === "STOP_LOSS_LIMIT") {
        requestParams.timeInForce = params.timeInForce ?? "GTC";
        requestParams.price = params.price;
      }

      if (params.type === "STOP_LOSS_LIMIT") {
        requestParams.stopPrice = params.stopPrice;
      }

      return await this.signedRequest<BinanceOrderResponse>(
        "POST",
        "/api/v3/order",
        requestParams
      );
    } catch (error) {
      throw new Error(
        `Failed to place ${params.type} order: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async placeOcoOrder(params: PlaceOcoOrderParams): Promise<BinanceOcoResponse> {
    try {
      return await this.signedRequest<BinanceOcoResponse>(
        "POST",
        "/api/v3/order/oco",
        {
          symbol: params.symbol,
          side: params.side,
          quantity: params.quantity,
          price: params.price,
          stopPrice: params.stopPrice,
          stopLimitPrice: params.stopLimitPrice,
          stopLimitTimeInForce: params.stopLimitTimeInForce ?? "GTC",
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to place OCO order: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async cancelOrder(symbol: string, orderId: number): Promise<BinanceOrderResponse> {
    try {
      return await this.signedRequest<BinanceOrderResponse>(
        "DELETE",
        "/api/v3/order",
        { symbol, orderId }
      );
    } catch (error) {
      throw new Error(
        `Failed to cancel order ${orderId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async cancelAllOrders(symbol: string): Promise<BinanceOrderResponse[]> {
    try {
      return await this.signedRequest<BinanceOrderResponse[]>(
        "DELETE",
        "/api/v3/openOrders",
        { symbol }
      );
    } catch (error) {
      throw new Error(
        `Failed to cancel all orders for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getOpenOrders(symbol?: string): Promise<BinanceOpenOrder[]> {
    try {
      const params: Record<string, string | number | undefined> = {};
      if (symbol) params.symbol = symbol;
      return await this.signedRequest<BinanceOpenOrder[]>(
        "GET",
        "/api/v3/openOrders",
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get open orders: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllOrders(
    symbol: string,
    limit?: number
  ): Promise<BinanceOpenOrder[]> {
    try {
      return await this.signedRequest<BinanceOpenOrder[]>(
        "GET",
        "/api/v3/allOrders",
        { symbol, limit }
      );
    } catch (error) {
      throw new Error(
        `Failed to get order history for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getMyTrades(
    symbol: string,
    limit?: number
  ): Promise<BinanceTrade[]> {
    try {
      return await this.signedRequest<BinanceTrade[]>(
        "GET",
        "/api/v3/myTrades",
        { symbol, limit }
      );
    } catch (error) {
      throw new Error(
        `Failed to get trades for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getExchangeInfo(): Promise<ExchangeInfoResponse> {
    try {
      const response = await fetch(`${BINANCE_BASE_URL}/api/v3/exchangeInfo`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return (await response.json()) as ExchangeInfoResponse;
    } catch (error) {
      throw new Error(
        `Failed to get exchange info: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// ── Helper to create client from DB-stored keys ──────────────────────────────

import { getUserApiKeys } from "@/lib/binance/helpers";

export async function createBinanceClient(userId: string): Promise<BinanceOrderClient> {
  const keys = await getUserApiKeys(userId);
  if (!keys) {
    throw new Error("No Binance API keys configured. Please add your API keys in settings.");
  }
  return new BinanceOrderClient(keys.apiKey, keys.secretKey);
}
