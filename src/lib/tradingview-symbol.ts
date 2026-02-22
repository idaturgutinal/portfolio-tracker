/**
 * Convert our asset symbol to the TradingView widget symbol format.
 *
 * - Stocks/ETFs: pass through (e.g. "AAPL" → "AAPL")
 * - Crypto: strip dashes & ensure USD suffix (e.g. "BTC" → "BTCUSD", "BTC-USD" → "BTCUSD")
 */
export function toTradingViewSymbol(symbol: string, assetType: string): string {
  if (assetType === "CRYPTO") {
    const base = symbol.replace(/-USD$/i, "").replace(/-/g, "").toUpperCase();
    return `${base}USD`;
  }
  return symbol.toUpperCase();
}
