jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/marketData");

import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/services/dashboard.service";
import { getBatchQuotes, getFXRate, toMarketSymbol } from "@/services/marketData";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetBatchQuotes = getBatchQuotes as jest.MockedFunction<typeof getBatchQuotes>;
const mockGetFXRate = getFXRate as jest.MockedFunction<typeof getFXRate>;
const mockToMarketSymbol = toMarketSymbol as jest.MockedFunction<typeof toMarketSymbol>;

describe("dashboard.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToMarketSymbol.mockImplementation((symbol, assetType) =>
      assetType === "CRYPTO" ? `${symbol.toUpperCase()}-USD` : symbol.toUpperCase()
    );
    mockGetFXRate.mockResolvedValue(1); // Default USD
  });

  it("should return empty dashboard when user has no portfolios", async () => {
    (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([]);
    mockGetBatchQuotes.mockResolvedValue(new Map() as any);

    const result = await getDashboardData("u1");

    expect(result.totalValue).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.totalGainLoss).toBe(0);
    expect(result.allAssets).toEqual([]);
    expect(result.performance.daily).toEqual([]);
  });

  it("should calculate totals with live prices", async () => {
    (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([
      {
        id: "p1",
        assets: [
          {
            id: "a1",
            symbol: "AAPL",
            name: "Apple",
            assetType: "STOCK",
            quantity: 10,
            averageBuyPrice: 150,
            transactions: [],
          },
          {
            id: "a2",
            symbol: "GOOGL",
            name: "Google",
            assetType: "STOCK",
            quantity: 5,
            averageBuyPrice: 2800,
            transactions: [],
          },
        ],
      },
    ]);

    const quotesMap = new Map<string, { price: number }>();
    quotesMap.set("AAPL", { price: 180 } as any);
    quotesMap.set("GOOGL", { price: 3000 } as any);
    mockGetBatchQuotes.mockResolvedValue(quotesMap as any);

    const result = await getDashboardData("u1");

    // AAPL: 10 * 180 = 1800, GOOGL: 5 * 3000 = 15000
    expect(result.totalValue).toBe(16800);
    // Cost: 10*150 + 5*2800 = 1500 + 14000 = 15500
    expect(result.totalCost).toBe(15500);
    expect(result.totalGainLoss).toBe(1300);
    expect(result.allAssets).toHaveLength(2);
  });

  it("should merge same symbols across portfolios", async () => {
    (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([
      {
        id: "p1",
        assets: [
          {
            id: "a1",
            symbol: "AAPL",
            name: "Apple",
            assetType: "STOCK",
            quantity: 10,
            averageBuyPrice: 150,
            transactions: [],
          },
        ],
      },
      {
        id: "p2",
        assets: [
          {
            id: "a2",
            symbol: "AAPL",
            name: "Apple",
            assetType: "STOCK",
            quantity: 5,
            averageBuyPrice: 160,
            transactions: [],
          },
        ],
      },
    ]);

    const quotesMap = new Map<string, { price: number }>();
    quotesMap.set("AAPL", { price: 180 } as any);
    mockGetBatchQuotes.mockResolvedValue(quotesMap as any);

    const result = await getDashboardData("u1");

    // Merged: qty = 15, weighted avg = (10*150 + 5*160) / 15 = 2300/15 ≈ 153.33
    expect(result.allAssets).toHaveLength(1);
    expect(result.allAssets[0].quantity).toBe(15);
    // Value: 15 * 180 = 2700
    expect(result.totalValue).toBe(2700);
  });

  it("should apply FX rate for non-USD currency", async () => {
    (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([
      {
        id: "p1",
        assets: [
          {
            id: "a1",
            symbol: "AAPL",
            name: "Apple",
            assetType: "STOCK",
            quantity: 10,
            averageBuyPrice: 150,
            transactions: [],
          },
        ],
      },
    ]);

    const quotesMap = new Map<string, { price: number }>();
    quotesMap.set("AAPL", { price: 180 } as any);
    mockGetBatchQuotes.mockResolvedValue(quotesMap as any);
    mockGetFXRate.mockResolvedValue(0.85); // EUR rate

    const result = await getDashboardData("u1", "EUR");

    // Value: 10 * 180 * 0.85 = 1530
    expect(result.totalValue).toBe(1530);
    // Cost: 10 * 150 * 0.85 = 1275
    expect(result.totalCost).toBe(1275);
  });

  it("should set pricesStale when a quote is missing", async () => {
    (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([
      {
        id: "p1",
        assets: [
          {
            id: "a1",
            symbol: "UNKNOWN",
            name: "Unknown Co",
            assetType: "STOCK",
            quantity: 10,
            averageBuyPrice: 50,
            transactions: [],
          },
        ],
      },
    ]);

    mockGetBatchQuotes.mockResolvedValue(new Map() as any);

    const result = await getDashboardData("u1");
    expect(result.pricesStale).toBe(true);
  });

  it("should compute allocation by asset type", async () => {
    (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([
      {
        id: "p1",
        assets: [
          {
            id: "a1",
            symbol: "AAPL",
            name: "Apple",
            assetType: "STOCK",
            quantity: 10,
            averageBuyPrice: 100,
            transactions: [],
          },
          {
            id: "a2",
            symbol: "BTC",
            name: "Bitcoin",
            assetType: "CRYPTO",
            quantity: 1,
            averageBuyPrice: 40000,
            transactions: [],
          },
        ],
      },
    ]);

    const quotesMap = new Map<string, { price: number }>();
    quotesMap.set("AAPL", { price: 100 } as any);
    quotesMap.set("BTC-USD", { price: 40000 } as any);
    mockGetBatchQuotes.mockResolvedValue(quotesMap as any);

    const result = await getDashboardData("u1");

    expect(result.allocationByType).toHaveLength(2);
    const stockAlloc = result.allocationByType.find((a) => a.type === "STOCK");
    const cryptoAlloc = result.allocationByType.find((a) => a.type === "CRYPTO");
    expect(stockAlloc).toBeDefined();
    expect(cryptoAlloc).toBeDefined();
    // STOCK: 1000 / 41000, CRYPTO: 40000 / 41000
    expect(stockAlloc!.pct + cryptoAlloc!.pct).toBeCloseTo(1);
  });
});
