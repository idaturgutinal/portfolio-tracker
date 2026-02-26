import { toMarketSymbol } from "@/services/marketData";

// We test the pure utility function directly.
// The async functions (getQuote, getBatchQuotes, etc.) depend on external HTTP
// and are best tested with integration/e2e tests. We mock them in consumer tests.

describe("marketData", () => {
  describe("toMarketSymbol", () => {
    it("should append -USD for CRYPTO symbols without dash", () => {
      expect(toMarketSymbol("BTC", "CRYPTO")).toBe("BTC-USD");
      expect(toMarketSymbol("eth", "CRYPTO")).toBe("ETH-USD");
    });

    it("should not modify CRYPTO symbols that already have a dash", () => {
      expect(toMarketSymbol("BTC-USD", "CRYPTO")).toBe("BTC-USD");
    });

    it("should uppercase STOCK symbols without modification", () => {
      expect(toMarketSymbol("aapl", "STOCK")).toBe("AAPL");
      expect(toMarketSymbol("GOOGL", "STOCK")).toBe("GOOGL");
    });

    it("should uppercase ETF symbols without modification", () => {
      expect(toMarketSymbol("spy", "ETF")).toBe("SPY");
    });

    it("should handle other asset types by uppercasing", () => {
      expect(toMarketSymbol("abc", "BOND")).toBe("ABC");
      expect(toMarketSymbol("xyz", "MUTUAL_FUND")).toBe("XYZ");
    });
  });
});
