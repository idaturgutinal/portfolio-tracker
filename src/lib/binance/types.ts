// ── Enums ────────────────────────────────────────────────────────────────────

export type OrderSide = "BUY" | "SELL";

export type OrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_LOSS_LIMIT"
  | "TAKE_PROFIT_LIMIT"
  | "LIMIT_MAKER"
  | "OCO";

export type OrderStatus =
  | "NEW"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELED"
  | "PENDING_CANCEL"
  | "REJECTED"
  | "EXPIRED";

export type KlineInterval =
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

export type TimeInForce = "GTC" | "IOC" | "FOK";

// ── Market Data ──────────────────────────────────────────────────────────────

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface TickerPrice {
  symbol: string;
  price: string;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBookResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

/** Kline/candlestick array from Binance (positional tuple) */
export type KlineData = [
  number,   // openTime
  string,   // open
  string,   // high
  string,   // low
  string,   // close
  string,   // volume
  number,   // closeTime
  string,   // quoteAssetVolume
  number,   // numberOfTrades
  string,   // takerBuyBaseAssetVolume
  string,   // takerBuyQuoteAssetVolume
  string,   // ignore
];

export interface TradeData {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

// ── Exchange Info ────────────────────────────────────────────────────────────

export interface SymbolFilter {
  filterType: string;
  minPrice?: string;
  maxPrice?: string;
  tickSize?: string;
  minQty?: string;
  maxQty?: string;
  stepSize?: string;
  minNotional?: string;
}

export interface SymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: SymbolFilter[];
}

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: {
    rateLimitType: string;
    interval: string;
    intervalNum: number;
    limit: number;
  }[];
  symbols: SymbolInfo[];
}

// ── Account & Orders ─────────────────────────────────────────────────────────

export interface Balance {
  asset: string;
  free: string;
  locked: string;
}

export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Balance[];
}

export interface OrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: OrderStatus;
  timeInForce: string;
  type: string;
  side: OrderSide;
  fills?: {
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }[];
}

export interface OpenOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: OrderStatus;
  timeInForce: string;
  type: string;
  side: OrderSide;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}

export interface TradeHistoryItem {
  symbol: string;
  id: number;
  orderId: number;
  orderListId: number;
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

// ── OCO Order ────────────────────────────────────────────────────────────────

export interface OcoOrderResponse {
  orderListId: number;
  contingencyType: string;
  listStatusType: string;
  listOrderStatus: string;
  listClientOrderId: string;
  transactionTime: number;
  symbol: string;
  orders: {
    symbol: string;
    orderId: number;
    clientOrderId: string;
  }[];
  orderReports: OrderResponse[];
}

// ── WebSocket Messages ───────────────────────────────────────────────────────

export interface WsTickerMessage {
  e: "24hrTicker";
  E: number;
  s: string;
  p: string;
  P: string;
  w: string;
  c: string;
  Q: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}

export interface WsKlineMessage {
  e: "kline";
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
  };
}

export interface WsTradeMessage {
  e: "trade";
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  b: number;
  a: number;
  T: number;
  m: boolean;
  M: boolean;
}

export interface WsDepthMessage {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface WsUserDataMessage {
  e: "outboundAccountPosition" | "executionReport" | "balanceUpdate";
  E: number;
  [key: string]: unknown;
}

export type WebSocketMessage =
  | WsTickerMessage
  | WsKlineMessage
  | WsTradeMessage
  | WsDepthMessage
  | WsUserDataMessage;

// ── Binance API Error ────────────────────────────────────────────────────────

export interface BinanceApiError {
  code: number;
  msg: string;
}

// ── User Data Stream ─────────────────────────────────────────────────────────

export interface ListenKeyResponse {
  listenKey: string;
}

// ── Order Request Params ─────────────────────────────────────────────────────

export interface NewOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: TimeInForce;
  newClientOrderId?: string;
}

export interface CancelOrderParams {
  symbol: string;
  orderId?: number;
  origClientOrderId?: string;
}

export interface OcoOrderParams {
  symbol: string;
  side: OrderSide;
  quantity: string;
  price: string;
  stopPrice: string;
  stopLimitPrice?: string;
  stopLimitTimeInForce?: TimeInForce;
}
