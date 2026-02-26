import crypto from "crypto";
import type {
  BinanceApiError,
  Ticker24hr,
  TickerPrice,
  OrderBookResponse,
  KlineData,
  TradeData,
  AccountInfo,
  OrderResponse,
  OpenOrder,
  TradeHistoryItem,
  ExchangeInfo,
  KlineInterval,
  NewOrderParams,
  CancelOrderParams,
  OcoOrderParams,
  OcoOrderResponse,
  ListenKeyResponse,
} from "./types";

// ── Binance error code → readable message ────────────────────────────────────

const BINANCE_ERROR_MESSAGES: Record<number, string> = {
  [-1000]: "Unknown error from Binance",
  [-1001]: "Binance is temporarily unavailable (disconnected)",
  [-1002]: "Unauthorized — invalid API key",
  [-1003]: "Rate limit exceeded on Binance side",
  [-1006]: "Unexpected response from Binance",
  [-1007]: "Request timeout",
  [-1013]: "Invalid quantity for this symbol",
  [-1014]: "Unsupported order combination",
  [-1015]: "Too many new orders",
  [-1016]: "Unsupported function",
  [-1020]: "Unsupported operation",
  [-1021]: "Timestamp outside recvWindow",
  [-1022]: "Invalid signature",
  [-1100]: "Illegal characters in parameter",
  [-1101]: "Too many parameters",
  [-1102]: "Required parameter missing",
  [-1103]: "Unknown parameter",
  [-1104]: "Unread parameters",
  [-1105]: "Parameter is empty",
  [-1106]: "Parameter not required",
  [-1111]: "Invalid precision",
  [-1112]: "No open orders",
  [-1114]: "Invalid timeInForce",
  [-1115]: "Invalid orderType",
  [-1116]: "Invalid side",
  [-1117]: "Empty recvWindow",
  [-1118]: "Trigger price type invalid",
  [-1119]: "Invalid parameter",
  [-2010]: "New order rejected",
  [-2011]: "Cancel rejected",
  [-2013]: "Order does not exist",
  [-2014]: "Invalid API key format",
  [-2015]: "Invalid API key, IP, or permissions",
};

export class BinanceClientError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly originalMessage: string,
  ) {
    super(message);
    this.name = "BinanceClientError";
  }
}

// ── BinanceClient ────────────────────────────────────────────────────────────

export class BinanceClient {
  private readonly baseUrl = "https://api.binance.com";
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly recvWindow: number;
  private readonly maxRetries: number;

  constructor(options: {
    apiKey: string;
    secretKey: string;
    recvWindow?: number;
    maxRetries?: number;
  }) {
    this.apiKey = options.apiKey;
    this.secretKey = options.secretKey;
    this.recvWindow = options.recvWindow ?? 5000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  // ── Signature ────────────────────────────────────────────────────────────

  private createSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(queryString)
      .digest("hex");
  }

  // ── Build query string ───────────────────────────────────────────────────

  private buildQueryString(params: Record<string, string | number | undefined>): string {
    const entries = Object.entries(params).filter(
      (entry): entry is [string, string | number] => entry[1] !== undefined,
    );
    return new URLSearchParams(
      entries.map(([k, v]) => [k, String(v)]),
    ).toString();
  }

  // ── Retry wrapper ────────────────────────────────────────────────────────

  private async fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`[Binance] ${init.method ?? "GET"} ${url} (attempt ${attempt + 1})`);
        const response = await fetch(url, init);

        if (response.status === 429 || response.status >= 500) {
          const backoff = Math.pow(2, attempt) * 1000;
          console.log(`[Binance] Retryable status ${response.status}, waiting ${backoff}ms`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`[Binance] Network error: ${lastError.message}, waiting ${backoff}ms`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    throw lastError ?? new Error("Max retries exceeded");
  }

  // ── Parse response ──────────────────────────────────────────────────────

  private async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    let data: T | BinanceApiError;

    try {
      data = JSON.parse(text);
    } catch {
      throw new BinanceClientError(
        -1006,
        "Failed to parse Binance response",
        text,
      );
    }

    if (!response.ok) {
      const apiError = data as BinanceApiError;
      const code = apiError.code ?? response.status;
      const friendlyMessage =
        BINANCE_ERROR_MESSAGES[code] ?? apiError.msg ?? `HTTP ${response.status}`;
      console.log(`[Binance] Error ${code}: ${friendlyMessage}`);
      throw new BinanceClientError(code, friendlyMessage, apiError.msg ?? text);
    }

    console.log(`[Binance] Response OK`);
    return data as T;
  }

  // ── Public request (unsigned) ─────────────────────────────────────────

  async publicRequest<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const qs = this.buildQueryString(params);
    const url = `${this.baseUrl}${endpoint}${qs ? `?${qs}` : ""}`;

    const response = await this.fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return this.parseResponse<T>(response);
  }

  // ── Signed request ───────────────────────────────────────────────────────

  async signedRequest<T>(
    method: "GET" | "POST" | "DELETE",
    endpoint: string,
    params: Record<string, string | number | undefined> = {},
  ): Promise<T> {
    const timestamp = Date.now();
    const allParams: Record<string, string | number | undefined> = {
      ...params,
      timestamp,
      recvWindow: this.recvWindow,
    };

    const qs = this.buildQueryString(allParams);
    const signature = this.createSignature(qs);
    const fullQs = `${qs}&signature=${signature}`;

    const url = `${this.baseUrl}${endpoint}?${fullQs}`;

    const response = await this.fetchWithRetry(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-MBX-APIKEY": this.apiKey,
      },
    });

    return this.parseResponse<T>(response);
  }

  // ── Public market data methods ─────────────────────────────────────────

  async getTicker24hr(symbol?: string): Promise<Ticker24hr | Ticker24hr[]> {
    return this.publicRequest("/api/v3/ticker/24hr", symbol ? { symbol } : {});
  }

  async getTickerPrice(symbol?: string): Promise<TickerPrice | TickerPrice[]> {
    return this.publicRequest("/api/v3/ticker/price", symbol ? { symbol } : {});
  }

  async getOrderBook(symbol: string, limit = 100): Promise<OrderBookResponse> {
    return this.publicRequest("/api/v3/depth", { symbol, limit });
  }

  async getKlines(symbol: string, interval: KlineInterval, limit = 500): Promise<KlineData[]> {
    return this.publicRequest("/api/v3/klines", { symbol, interval, limit });
  }

  async getRecentTrades(symbol: string, limit = 500): Promise<TradeData[]> {
    return this.publicRequest("/api/v3/trades", { symbol, limit });
  }

  async getExchangeInfo(symbol?: string): Promise<ExchangeInfo> {
    return this.publicRequest("/api/v3/exchangeInfo", symbol ? { symbol } : {});
  }

  // ── Signed account methods ─────────────────────────────────────────────

  async getAccountInfo(): Promise<AccountInfo> {
    return this.signedRequest("GET", "/api/v3/account");
  }

  async newOrder(params: NewOrderParams): Promise<OrderResponse> {
    return this.signedRequest("POST", "/api/v3/order", {
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      quantity: params.quantity,
      price: params.price,
      stopPrice: params.stopPrice,
      timeInForce: params.timeInForce,
      newClientOrderId: params.newClientOrderId,
      newOrderRespType: "FULL",
    });
  }

  async cancelOrder(params: CancelOrderParams): Promise<OrderResponse> {
    return this.signedRequest("DELETE", "/api/v3/order", {
      symbol: params.symbol,
      orderId: params.orderId,
      origClientOrderId: params.origClientOrderId,
    });
  }

  async newOcoOrder(params: OcoOrderParams): Promise<OcoOrderResponse> {
    return this.signedRequest("POST", "/api/v3/order/oco", {
      symbol: params.symbol,
      side: params.side,
      quantity: params.quantity,
      price: params.price,
      stopPrice: params.stopPrice,
      stopLimitPrice: params.stopLimitPrice,
      stopLimitTimeInForce: params.stopLimitTimeInForce,
    });
  }

  async getOpenOrders(symbol?: string): Promise<OpenOrder[]> {
    return this.signedRequest("GET", "/api/v3/openOrders", symbol ? { symbol } : {});
  }

  async getAllOrders(symbol: string, limit = 500): Promise<OpenOrder[]> {
    return this.signedRequest("GET", "/api/v3/allOrders", { symbol, limit });
  }

  async getMyTrades(symbol: string, limit = 500): Promise<TradeHistoryItem[]> {
    return this.signedRequest("GET", "/api/v3/myTrades", { symbol, limit });
  }

  async createListenKey(): Promise<ListenKeyResponse> {
    return this.signedRequest("POST", "/api/v3/userDataStream");
  }
}

// ── Default public client (no API key needed for market data) ────────────────

export function createPublicClient(): BinanceClient {
  return new BinanceClient({ apiKey: "", secretKey: "" });
}
