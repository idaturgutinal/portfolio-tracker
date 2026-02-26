// Mock data for the trading terminal

export interface CoinPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  category: "USDT" | "BTC" | "BNB";
}

export const COIN_PAIRS: CoinPair[] = [
  { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", price: 67432.50, change24h: 2.54, high24h: 68100.00, low24h: 65800.00, volume24h: 1234567890, category: "USDT" },
  { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", price: 3456.78, change24h: -1.32, high24h: 3520.00, low24h: 3410.00, volume24h: 987654321, category: "USDT" },
  { symbol: "BNBUSDT", baseAsset: "BNB", quoteAsset: "USDT", price: 598.45, change24h: 0.87, high24h: 605.00, low24h: 590.00, volume24h: 456789012, category: "USDT" },
  { symbol: "SOLUSDT", baseAsset: "SOL", quoteAsset: "USDT", price: 178.90, change24h: 5.67, high24h: 182.00, low24h: 168.00, volume24h: 345678901, category: "USDT" },
  { symbol: "XRPUSDT", baseAsset: "XRP", quoteAsset: "USDT", price: 0.6234, change24h: -0.45, high24h: 0.6350, low24h: 0.6100, volume24h: 234567890, category: "USDT" },
  { symbol: "ADAUSDT", baseAsset: "ADA", quoteAsset: "USDT", price: 0.4567, change24h: 1.23, high24h: 0.4650, low24h: 0.4480, volume24h: 123456789, category: "USDT" },
  { symbol: "DOGEUSDT", baseAsset: "DOGE", quoteAsset: "USDT", price: 0.1234, change24h: -2.15, high24h: 0.1280, low24h: 0.1200, volume24h: 567890123, category: "USDT" },
  { symbol: "DOTUSDT", baseAsset: "DOT", quoteAsset: "USDT", price: 7.89, change24h: 3.45, high24h: 8.10, low24h: 7.50, volume24h: 89012345, category: "USDT" },
  { symbol: "AVAXUSDT", baseAsset: "AVAX", quoteAsset: "USDT", price: 35.67, change24h: -0.78, high24h: 36.50, low24h: 34.80, volume24h: 78901234, category: "USDT" },
  { symbol: "LINKUSDT", baseAsset: "LINK", quoteAsset: "USDT", price: 14.56, change24h: 1.89, high24h: 14.90, low24h: 14.10, volume24h: 67890123, category: "USDT" },
  { symbol: "MATICUSDT", baseAsset: "MATIC", quoteAsset: "USDT", price: 0.8765, change24h: -1.56, high24h: 0.8950, low24h: 0.8600, volume24h: 56789012, category: "USDT" },
  { symbol: "UNIUSDT", baseAsset: "UNI", quoteAsset: "USDT", price: 9.87, change24h: 2.34, high24h: 10.10, low24h: 9.50, volume24h: 45678901, category: "USDT" },
  { symbol: "LTCUSDT", baseAsset: "LTC", quoteAsset: "USDT", price: 72.34, change24h: 0.56, high24h: 73.50, low24h: 71.00, volume24h: 34567890, category: "USDT" },
  { symbol: "ATOMUSDT", baseAsset: "ATOM", quoteAsset: "USDT", price: 8.45, change24h: -3.21, high24h: 8.90, low24h: 8.20, volume24h: 23456789, category: "USDT" },
  { symbol: "NEARUSDT", baseAsset: "NEAR", quoteAsset: "USDT", price: 5.67, change24h: 4.56, high24h: 5.80, low24h: 5.30, volume24h: 12345678, category: "USDT" },
  { symbol: "FILUSDT", baseAsset: "FIL", quoteAsset: "USDT", price: 5.89, change24h: -0.34, high24h: 6.10, low24h: 5.70, volume24h: 9876543, category: "USDT" },
  { symbol: "AAVEUSDT", baseAsset: "AAVE", quoteAsset: "USDT", price: 98.76, change24h: 1.67, high24h: 100.50, low24h: 96.80, volume24h: 8765432, category: "USDT" },
  { symbol: "ALGOUSDT", baseAsset: "ALGO", quoteAsset: "USDT", price: 0.1876, change24h: -1.89, high24h: 0.1950, low24h: 0.1830, volume24h: 7654321, category: "USDT" },
  { symbol: "APTUSDT", baseAsset: "APT", quoteAsset: "USDT", price: 8.34, change24h: 2.78, high24h: 8.60, low24h: 8.00, volume24h: 6543210, category: "USDT" },
  { symbol: "ARBUSDT", baseAsset: "ARB", quoteAsset: "USDT", price: 1.12, change24h: -0.67, high24h: 1.15, low24h: 1.08, volume24h: 5432109, category: "USDT" },
  { symbol: "OPUSDT", baseAsset: "OP", quoteAsset: "USDT", price: 2.34, change24h: 3.12, high24h: 2.40, low24h: 2.20, volume24h: 4321098, category: "USDT" },
  { symbol: "ICPUSDT", baseAsset: "ICP", quoteAsset: "USDT", price: 12.56, change24h: -2.45, high24h: 13.00, low24h: 12.10, volume24h: 3210987, category: "USDT" },
  { symbol: "RENDERUSDT", baseAsset: "RENDER", quoteAsset: "USDT", price: 7.89, change24h: 6.78, high24h: 8.10, low24h: 7.20, volume24h: 2109876, category: "USDT" },
  { symbol: "INJUSDT", baseAsset: "INJ", quoteAsset: "USDT", price: 24.56, change24h: 1.23, high24h: 25.00, low24h: 23.80, volume24h: 1098765, category: "USDT" },
  { symbol: "TIAUSDT", baseAsset: "TIA", quoteAsset: "USDT", price: 11.23, change24h: -4.56, high24h: 12.00, low24h: 10.80, volume24h: 987654, category: "USDT" },
  { symbol: "SEIUSDT", baseAsset: "SEI", quoteAsset: "USDT", price: 0.5678, change24h: 2.34, high24h: 0.5800, low24h: 0.5500, volume24h: 876543, category: "USDT" },
  { symbol: "SUIUSDT", baseAsset: "SUI", quoteAsset: "USDT", price: 1.45, change24h: 7.89, high24h: 1.50, low24h: 1.30, volume24h: 765432, category: "USDT" },
  { symbol: "FETUSDT", baseAsset: "FET", quoteAsset: "USDT", price: 2.12, change24h: -1.23, high24h: 2.20, low24h: 2.05, volume24h: 654321, category: "USDT" },
  { symbol: "PEPEUSDT", baseAsset: "PEPE", quoteAsset: "USDT", price: 0.00001234, change24h: 12.34, high24h: 0.00001300, low24h: 0.00001100, volume24h: 543210, category: "USDT" },
  { symbol: "WIFUSDT", baseAsset: "WIF", quoteAsset: "USDT", price: 2.87, change24h: -5.67, high24h: 3.10, low24h: 2.70, volume24h: 432109, category: "USDT" },
  { symbol: "ETHBTC", baseAsset: "ETH", quoteAsset: "BTC", price: 0.05123, change24h: -0.34, high24h: 0.05200, low24h: 0.05050, volume24h: 12345, category: "BTC" },
  { symbol: "BNBBTC", baseAsset: "BNB", quoteAsset: "BTC", price: 0.00887, change24h: 0.12, high24h: 0.00900, low24h: 0.00870, volume24h: 5678, category: "BTC" },
  { symbol: "SOLBTC", baseAsset: "SOL", quoteAsset: "BTC", price: 0.002654, change24h: 3.21, high24h: 0.002700, low24h: 0.002550, volume24h: 3456, category: "BTC" },
  { symbol: "XRPBTC", baseAsset: "XRP", quoteAsset: "BTC", price: 0.00000924, change24h: -1.56, high24h: 0.00000950, low24h: 0.00000900, volume24h: 2345, category: "BTC" },
  { symbol: "ETHBNB", baseAsset: "ETH", quoteAsset: "BNB", price: 5.776, change24h: -0.89, high24h: 5.850, low24h: 5.700, volume24h: 1234, category: "BNB" },
  { symbol: "BTCBNB", baseAsset: "BTC", quoteAsset: "BNB", price: 112.67, change24h: 1.45, high24h: 114.00, low24h: 110.50, volume24h: 987, category: "BNB" },
];

// Generate realistic candlestick data
export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function generateCandleData(basePrice: number, count: number, intervalMinutes: number): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = basePrice * 0.92;
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = intervalMinutes * 60;
  const startTime = now - count * intervalSeconds;

  for (let i = 0; i < count; i++) {
    const volatility = currentPrice * 0.015;
    const open = currentPrice;
    const change1 = (Math.random() - 0.48) * volatility;
    const change2 = (Math.random() - 0.48) * volatility;
    const close = open + change1;
    const high = Math.max(open, close) + Math.abs(change2) * 0.5;
    const low = Math.min(open, close) - Math.abs(change2) * 0.5;
    const volume = Math.floor(Math.random() * 1000 + 100) * (basePrice / 100);

    candles.push({
      time: startTime + i * intervalSeconds,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
    });

    currentPrice = close;
  }

  return candles;
}

// Generate order book data
export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export function generateOrderBook(
  midPrice: number,
  levels: number,
  precision: number
): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];

  let askTotal = 0;
  for (let i = 0; i < levels; i++) {
    const price = parseFloat((midPrice + (i + 1) * precision).toFixed(2));
    const amount = parseFloat((Math.random() * 5 + 0.1).toFixed(4));
    askTotal += amount;
    asks.push({ price, amount, total: parseFloat(askTotal.toFixed(4)) });
  }

  let bidTotal = 0;
  for (let i = 0; i < levels; i++) {
    const price = parseFloat((midPrice - (i + 1) * precision).toFixed(2));
    const amount = parseFloat((Math.random() * 5 + 0.1).toFixed(4));
    bidTotal += amount;
    bids.push({ price, amount, total: parseFloat(bidTotal.toFixed(4)) });
  }

  return { asks, bids };
}

// Generate market trades
export interface MarketTrade {
  id: number;
  price: number;
  amount: number;
  time: string;
  isBuy: boolean;
}

export function generateMarketTrades(basePrice: number, count: number): MarketTrade[] {
  const trades: MarketTrade[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - i * 3000);
    const priceVariation = (Math.random() - 0.5) * basePrice * 0.002;
    trades.push({
      id: count - i,
      price: parseFloat((basePrice + priceVariation).toFixed(2)),
      amount: parseFloat((Math.random() * 2 + 0.001).toFixed(4)),
      time: time.toLocaleTimeString("en-US", { hour12: false }),
      isBuy: Math.random() > 0.5,
    });
  }

  return trades;
}

// Open orders mock data
export interface OpenOrder {
  id: string;
  date: string;
  pair: string;
  type: "Limit" | "Market" | "Stop-Limit";
  side: "Buy" | "Sell";
  price: number;
  amount: number;
  filled: number;
}

export const MOCK_OPEN_ORDERS: OpenOrder[] = [
  { id: "1", date: "2024-01-15 14:23:45", pair: "BTC/USDT", type: "Limit", side: "Buy", price: 65000.00, amount: 0.5, filled: 0 },
  { id: "2", date: "2024-01-15 13:12:30", pair: "ETH/USDT", type: "Limit", side: "Sell", price: 3600.00, amount: 2.0, filled: 50 },
  { id: "3", date: "2024-01-15 12:45:00", pair: "SOL/USDT", type: "Stop-Limit", side: "Buy", price: 170.00, amount: 10.0, filled: 0 },
];

// Order history mock data
export interface OrderHistory {
  id: string;
  date: string;
  pair: string;
  type: "Limit" | "Market" | "Stop-Limit";
  price: number;
  amount: number;
  status: "Filled" | "Cancelled" | "Partially Filled";
}

export const MOCK_ORDER_HISTORY: OrderHistory[] = [
  { id: "1", date: "2024-01-15 10:30:00", pair: "BTC/USDT", type: "Market", price: 67000.00, amount: 0.1, status: "Filled" },
  { id: "2", date: "2024-01-14 16:45:00", pair: "ETH/USDT", type: "Limit", price: 3400.00, amount: 1.5, status: "Filled" },
  { id: "3", date: "2024-01-14 09:20:00", pair: "SOL/USDT", type: "Limit", price: 180.00, amount: 5.0, status: "Cancelled" },
  { id: "4", date: "2024-01-13 22:10:00", pair: "BNB/USDT", type: "Market", price: 595.00, amount: 3.0, status: "Filled" },
  { id: "5", date: "2024-01-13 14:30:00", pair: "DOGE/USDT", type: "Limit", price: 0.12, amount: 5000.0, status: "Partially Filled" },
];

// Trade history mock data
export interface TradeHistory {
  id: string;
  date: string;
  pair: string;
  side: "Buy" | "Sell";
  price: number;
  amount: number;
  fee: number;
  total: number;
}

export const MOCK_TRADE_HISTORY: TradeHistory[] = [
  { id: "1", date: "2024-01-15 10:30:00", pair: "BTC/USDT", side: "Buy", price: 67000.00, amount: 0.1, fee: 6.70, total: 6706.70 },
  { id: "2", date: "2024-01-14 16:45:00", pair: "ETH/USDT", side: "Buy", price: 3400.00, amount: 1.5, fee: 5.10, total: 5105.10 },
  { id: "3", date: "2024-01-14 08:00:00", pair: "SOL/USDT", side: "Sell", price: 175.00, amount: 10.0, fee: 1.75, total: 1748.25 },
  { id: "4", date: "2024-01-13 22:10:00", pair: "BNB/USDT", side: "Buy", price: 595.00, amount: 3.0, fee: 1.79, total: 1786.79 },
  { id: "5", date: "2024-01-13 15:20:00", pair: "AVAX/USDT", side: "Sell", price: 36.00, amount: 50.0, fee: 1.80, total: 1798.20 },
];

// Balance mock data
export interface BalanceEntry {
  coin: string;
  total: number;
  available: number;
  locked: number;
  usdtValue: number;
}

export const MOCK_BALANCES: BalanceEntry[] = [
  { coin: "USDT", total: 10000.00, available: 8500.00, locked: 1500.00, usdtValue: 10000.00 },
  { coin: "BTC", total: 0.5, available: 0.45, locked: 0.05, usdtValue: 33716.25 },
  { coin: "ETH", total: 5.0, available: 4.0, locked: 1.0, usdtValue: 17283.90 },
  { coin: "BNB", total: 10.0, available: 10.0, locked: 0, usdtValue: 5984.50 },
  { coin: "SOL", total: 50.0, available: 40.0, locked: 10.0, usdtValue: 8945.00 },
  { coin: "XRP", total: 5000.0, available: 5000.0, locked: 0, usdtValue: 3117.00 },
  { coin: "ADA", total: 10000.0, available: 10000.0, locked: 0, usdtValue: 4567.00 },
  { coin: "DOGE", total: 50000.0, available: 45000.0, locked: 5000.0, usdtValue: 6170.00 },
  { coin: "DOT", total: 100.0, available: 100.0, locked: 0, usdtValue: 789.00 },
  { coin: "LINK", total: 200.0, available: 200.0, locked: 0, usdtValue: 2912.00 },
  { coin: "AVAX", total: 0, available: 0, locked: 0, usdtValue: 0 },
  { coin: "MATIC", total: 0, available: 0, locked: 0, usdtValue: 0 },
];

// Portfolio distribution for pie chart
export const PORTFOLIO_DISTRIBUTION = [
  { name: "BTC", value: 33716.25, color: "#F7931A" },
  { name: "ETH", value: 17283.90, color: "#627EEA" },
  { name: "USDT", value: 10000.00, color: "#26A17B" },
  { name: "SOL", value: 8945.00, color: "#9945FF" },
  { name: "DOGE", value: 6170.00, color: "#C2A633" },
  { name: "Other", value: 17369.50, color: "#8884d8" },
];

// PnL data for last 30 days
export function generatePnLData(): { date: string; pnl: number }[] {
  const data: { date: string; pnl: number }[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      pnl: parseFloat((Math.random() * 2000 - 800).toFixed(2)),
    });
  }

  return data;
}
