/**
 * Market data service
 *
 * Primary provider:  Yahoo Finance (unofficial v8 API — no key required)
 * Fallback provider: Alpha Vantage free tier (set ALPHA_VANTAGE_API_KEY in .env)
 *
 * Caching strategy:
 *   - Quotes:  5-minute in-memory TTL
 *   - History: 1-hour  in-memory TTL
 *   - On refresh failure, stale cache is returned with `stale: true`
 */

// ─── Public types ────────────────────────────────────────────────────────────

export interface PriceQuote {
  symbol: string;
  price: number;
  currency: string;
  /** Absolute change from previous close */
  change: number;
  /** Fractional change from previous close: 0.05 = +5% */
  changePercent: number;
  volume?: number;
  /** Unix timestamp (seconds) of last trade */
  timestamp: number;
}

export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataResult<T> {
  data: T | null;
  error: string | null;
  /** true when fresh fetch failed but cached data was returned */
  stale: boolean;
}

export type HistoryRange = "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y";

// ─── Internal cache ──────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  ts: number; // Date.now()
}

const priceCache = new Map<string, CacheEntry<PriceQuote>>();
const historyCache = new Map<string, CacheEntry<HistoricalDataPoint[]>>();

const PRICE_TTL = 5 * 60_000;    // 5 minutes
const HISTORY_TTL = 60 * 60_000; // 1 hour

// ─── Yahoo Finance provider ──────────────────────────────────────────────────

const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; PortfolioTracker/1.0)",
  Accept: "application/json",
};

// Internal shape of Yahoo Finance v8 response
interface YFChartResponse {
  chart: {
    result?: Array<{
      meta: {
        symbol: string;
        currency?: string;
        regularMarketPrice: number;
        regularMarketChange?: number;
        regularMarketChangePercent?: number;
        regularMarketVolume?: number;
        regularMarketTime?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: unknown;
  };
}

async function yfQuote(symbol: string): Promise<PriceQuote> {
  const url = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, { headers: YF_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status} for ${symbol}`);

  const json = (await res.json()) as YFChartResponse;
  const r = json.chart?.result?.[0];
  if (!r) throw new Error(`No Yahoo Finance data for ${symbol}`);

  const { meta } = r;
  return {
    symbol: meta.symbol,
    price: meta.regularMarketPrice,
    currency: meta.currency ?? "USD",
    change: meta.regularMarketChange ?? 0,
    changePercent: (meta.regularMarketChangePercent ?? 0) / 100,
    volume: meta.regularMarketVolume,
    timestamp: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
  };
}

async function yfHistory(
  symbol: string,
  range: HistoryRange
): Promise<HistoricalDataPoint[]> {
  const url = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
  const res = await fetch(url, { headers: YF_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status} for ${symbol}`);

  const json = (await res.json()) as YFChartResponse;
  const r = json.chart?.result?.[0];
  if (!r) throw new Error(`No Yahoo Finance history for ${symbol}`);

  const timestamps = r.timestamp ?? [];
  const q = r.indicators?.quote?.[0] ?? {};

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      open: q.open?.[i] ?? 0,
      high: q.high?.[i] ?? 0,
      low: q.low?.[i] ?? 0,
      close: q.close?.[i] ?? 0,
      volume: q.volume?.[i] ?? 0,
    }))
    .filter((d) => d.close > 0);
}

// ─── Alpha Vantage provider ──────────────────────────────────────────────────

const AV_BASE = "https://www.alphavantage.co/query";

async function avQuote(symbol: string): Promise<PriceQuote> {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error("ALPHA_VANTAGE_API_KEY not set");

  const url = `${AV_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Alpha Vantage ${res.status}`);

  const json = await res.json();
  const q = json["Global Quote"] as Record<string, string> | undefined;
  if (!q?.["05. price"]) throw new Error("Invalid Alpha Vantage quote response");

  return {
    symbol: q["01. symbol"],
    price: parseFloat(q["05. price"]),
    currency: "USD",
    change: parseFloat(q["09. change"] ?? "0"),
    changePercent: parseFloat((q["10. change percent"] ?? "0%").replace("%", "")) / 100,
    volume: parseInt(q["06. volume"] ?? "0", 10),
    timestamp: Math.floor(Date.now() / 1000),
  };
}

async function avHistory(symbol: string): Promise<HistoricalDataPoint[]> {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error("ALPHA_VANTAGE_API_KEY not set");

  const url = `${AV_BASE}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Alpha Vantage ${res.status}`);

  const json = await res.json();
  const series = json["Time Series (Daily)"] as
    | Record<string, Record<string, string>>
    | undefined;
  if (!series) throw new Error("Invalid Alpha Vantage history response");

  return Object.entries(series)
    .map(([date, vals]) => ({
      date,
      open: parseFloat(vals["1. open"]),
      high: parseFloat(vals["2. high"]),
      low: parseFloat(vals["3. low"]),
      close: parseFloat(vals["4. close"]),
      volume: parseInt(vals["6. volume"], 10),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Symbol search ───────────────────────────────────────────────────────────

interface YFSearchResponse {
  quotes?: Array<{
    symbol: string;
    longname?: string;
    shortname?: string;
    typeDisp?: string;
    exchange?: string;
  }>;
}

const YF_TYPE_MAP: Record<string, string> = {
  Equity: "STOCK",
  ETF: "ETF",
  Cryptocurrency: "CRYPTO",
  Mutualfund: "MUTUAL_FUND",
  Bond: "BOND",
};

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  /** Maps to our AssetType enum values */
  suggestedType: string;
  exchange?: string;
}

export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`;
    const res = await fetch(url, { headers: YF_HEADERS, cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as YFSearchResponse;
    return (json.quotes ?? []).map((q) => ({
      symbol: q.symbol,
      name: q.longname ?? q.shortname ?? q.symbol,
      suggestedType: YF_TYPE_MAP[q.typeDisp ?? ""] ?? "STOCK",
      exchange: q.exchange,
    }));
  } catch {
    return [];
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the current price for a single symbol.
 * Tries Yahoo Finance, then Alpha Vantage (if key set), then stale cache.
 */
export async function getQuote(
  symbol: string
): Promise<MarketDataResult<PriceQuote>> {
  const cacheKey = symbol.toUpperCase();
  const cached = priceCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.ts < PRICE_TTL) {
    return { data: cached.data, error: null, stale: false };
  }

  let lastError: string | null = null;

  try {
    const data = await yfQuote(symbol);
    priceCache.set(cacheKey, { data, ts: now });
    return { data, error: null, stale: false };
  } catch (e) {
    lastError = String(e);
  }

  if (process.env.ALPHA_VANTAGE_API_KEY) {
    try {
      const data = await avQuote(symbol);
      priceCache.set(cacheKey, { data, ts: now });
      return { data, error: null, stale: false };
    } catch (e) {
      lastError = String(e);
    }
  }

  if (cached) {
    return { data: cached.data, error: lastError, stale: true };
  }

  return { data: null, error: lastError, stale: false };
}

/**
 * Fetch quotes for multiple symbols concurrently.
 * Returns a Map<UPPERCASE_SYMBOL, PriceQuote | null>.
 */
export async function getBatchQuotes(
  symbols: string[]
): Promise<Map<string, PriceQuote | null>> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const settled = await Promise.allSettled(unique.map((s) => getQuote(s)));

  const map = new Map<string, PriceQuote | null>();
  unique.forEach((sym, i) => {
    const r = settled[i];
    map.set(sym, r.status === "fulfilled" ? r.value.data : null);
  });
  return map;
}

/**
 * Fetch OHLCV history for a symbol.
 * Tries Yahoo Finance, then Alpha Vantage (if key set), then stale cache.
 */
export async function getHistoricalData(
  symbol: string,
  range: HistoryRange = "1y"
): Promise<MarketDataResult<HistoricalDataPoint[]>> {
  const cacheKey = `${symbol.toUpperCase()}:${range}`;
  const cached = historyCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.ts < HISTORY_TTL) {
    return { data: cached.data, error: null, stale: false };
  }

  let lastError: string | null = null;

  try {
    const data = await yfHistory(symbol, range);
    historyCache.set(cacheKey, { data, ts: now });
    return { data, error: null, stale: false };
  } catch (e) {
    lastError = String(e);
  }

  if (process.env.ALPHA_VANTAGE_API_KEY) {
    try {
      const data = await avHistory(symbol);
      historyCache.set(cacheKey, { data, ts: now });
      return { data, error: null, stale: false };
    } catch (e) {
      lastError = String(e);
    }
  }

  if (cached) {
    return { data: cached.data, error: lastError, stale: true };
  }

  return { data: null, error: lastError, stale: false };
}

/**
 * Convert an asset symbol to the format Yahoo Finance expects.
 * Crypto stored as "BTC" becomes "BTC-USD".
 */
export function toMarketSymbol(symbol: string, assetType: string): string {
  if (assetType === "CRYPTO" && !symbol.includes("-")) {
    return `${symbol.toUpperCase()}-USD`;
  }
  return symbol.toUpperCase();
}

/**
 * Get the FX rate to convert USD values into `targetCurrency`.
 * Returns 1 for USD (no conversion). Fetches `{targetCurrency}USD=X` from
 * Yahoo Finance and inverts: 1 USD = (1 / EURUSD) EUR.
 */
export async function getFXRate(targetCurrency: string): Promise<number> {
  if (targetCurrency === "USD") return 1;
  const result = await getQuote(`${targetCurrency}USD=X`);
  if (!result.data || result.data.price === 0) return 1;
  return 1 / result.data.price;
}
