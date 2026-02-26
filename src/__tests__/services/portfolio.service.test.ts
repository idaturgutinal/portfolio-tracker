jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/marketData");

import { prisma } from "@/lib/prisma";
import {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  deletePortfolio,
  getPortfolioSummary,
  getAssetById,
  getAssetsByUser,
  updateAsset,
  deleteAsset,
  createAsset,
} from "@/services/portfolio.service";
import { getBatchQuotes, toMarketSymbol } from "@/services/marketData";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetBatchQuotes = getBatchQuotes as jest.MockedFunction<typeof getBatchQuotes>;
const mockToMarketSymbol = toMarketSymbol as jest.MockedFunction<typeof toMarketSymbol>;

describe("portfolio.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToMarketSymbol.mockImplementation((symbol, assetType) =>
      assetType === "CRYPTO" ? `${symbol.toUpperCase()}-USD` : symbol.toUpperCase()
    );
  });

  describe("getPortfolios", () => {
    it("should return portfolios for a user ordered by createdAt desc", async () => {
      const mockPortfolios = [
        { id: "p1", name: "Portfolio 1", userId: "u1", createdAt: new Date(), _count: { assets: 2 } },
        { id: "p2", name: "Portfolio 2", userId: "u1", createdAt: new Date(), _count: { assets: 0 } },
      ];
      (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue(mockPortfolios);

      const result = await getPortfolios("u1");

      expect(mockPrisma.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: "u1" },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { assets: true } } },
      });
      expect(result).toEqual(mockPortfolios);
    });

    it("should return empty array when user has no portfolios", async () => {
      (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getPortfolios("u-no-portfolios");
      expect(result).toEqual([]);
    });
  });

  describe("getPortfolioById", () => {
    it("should return portfolio with assets and transactions", async () => {
      const mockPortfolio = {
        id: "p1",
        name: "Test Portfolio",
        userId: "u1",
        assets: [{ id: "a1", symbol: "AAPL", transactions: [] }],
      };
      (mockPrisma.portfolio.findUnique as jest.Mock).mockResolvedValue(mockPortfolio);

      const result = await getPortfolioById("p1");

      expect(mockPrisma.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: "p1" },
        include: { assets: { include: { transactions: true } } },
      });
      expect(result).toEqual(mockPortfolio);
    });

    it("should return null for non-existent portfolio", async () => {
      (mockPrisma.portfolio.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getPortfolioById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("createPortfolio", () => {
    it("should create a portfolio with given name and userId", async () => {
      const created = { id: "p-new", name: "My Portfolio", userId: "u1", createdAt: new Date() };
      (mockPrisma.portfolio.create as jest.Mock).mockResolvedValue(created);

      const result = await createPortfolio({ name: "My Portfolio", userId: "u1" });

      expect(mockPrisma.portfolio.create).toHaveBeenCalledWith({
        data: { name: "My Portfolio", userId: "u1" },
      });
      expect(result).toEqual(created);
    });
  });

  describe("deletePortfolio", () => {
    it("should delete portfolio by id", async () => {
      (mockPrisma.portfolio.delete as jest.Mock).mockResolvedValue({ id: "p1" });

      await deletePortfolio("p1");

      expect(mockPrisma.portfolio.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    });
  });

  describe("getPortfolioSummary", () => {
    it("should return null if portfolio does not exist", async () => {
      (mockPrisma.portfolio.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getPortfolioSummary("nonexistent");
      expect(result).toBeNull();
    });

    it("should calculate summary with live prices", async () => {
      const portfolio = {
        id: "p1",
        name: "Test",
        assets: [
          { id: "a1", symbol: "AAPL", assetType: "STOCK", quantity: 10, averageBuyPrice: 150 },
          { id: "a2", symbol: "BTC", assetType: "CRYPTO", quantity: 1, averageBuyPrice: 40000 },
        ],
      };
      (mockPrisma.portfolio.findUnique as jest.Mock).mockResolvedValue(portfolio);

      const quotesMap = new Map<string, { price: number } | null>();
      quotesMap.set("AAPL", { price: 180 } as any);
      quotesMap.set("BTC-USD", { price: 50000 } as any);
      mockGetBatchQuotes.mockResolvedValue(quotesMap as any);

      const result = await getPortfolioSummary("p1");

      expect(result).not.toBeNull();
      // AAPL: 10 * 180 = 1800, BTC: 1 * 50000 = 50000, total = 51800
      expect(result!.totalValue).toBe(51800);
      // Cost: 10*150 + 1*40000 = 41500
      expect(result!.totalCost).toBe(41500);
      expect(result!.totalGainLoss).toBe(10300);
      expect(result!.assetCount).toBe(2);
    });

    it("should use averageBuyPrice as fallback when quote is missing", async () => {
      const portfolio = {
        id: "p1",
        name: "Test",
        assets: [
          { id: "a1", symbol: "AAPL", assetType: "STOCK", quantity: 5, averageBuyPrice: 100 },
        ],
      };
      (mockPrisma.portfolio.findUnique as jest.Mock).mockResolvedValue(portfolio);
      mockGetBatchQuotes.mockResolvedValue(new Map() as any);

      const result = await getPortfolioSummary("p1");

      expect(result!.totalValue).toBe(500); // 5 * 100 fallback
      expect(result!.totalGainLoss).toBe(0);
    });
  });

  describe("getAssetById", () => {
    it("should find asset by id and user ownership", async () => {
      const mockAsset = { id: "a1", symbol: "AAPL", portfolio: { id: "p1", name: "Main" } };
      (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue(mockAsset);

      const result = await getAssetById("a1", "u1");

      expect(mockPrisma.asset.findFirst).toHaveBeenCalledWith({
        where: { id: "a1", portfolio: { userId: "u1" } },
        include: { portfolio: { select: { id: true, name: true } } },
      });
      expect(result).toEqual(mockAsset);
    });
  });

  describe("getAssetsByUser", () => {
    it("should return all user assets with portfolio info", async () => {
      const mockAssets = [
        { id: "a1", symbol: "AAPL", portfolio: { id: "p1", name: "Main" } },
      ];
      (mockPrisma.asset.findMany as jest.Mock).mockResolvedValue(mockAssets);

      const result = await getAssetsByUser("u1");
      expect(result).toEqual(mockAssets);
    });
  });

  describe("updateAsset", () => {
    it("should update asset with provided fields", async () => {
      const updated = { id: "a1", symbol: "AAPL", name: "Apple Inc Updated" };
      (mockPrisma.asset.update as jest.Mock).mockResolvedValue(updated);

      const result = await updateAsset("a1", { name: "Apple Inc Updated" });

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { name: "Apple Inc Updated" },
      });
      expect(result).toEqual(updated);
    });

    it("should include assetType in update when provided", async () => {
      (mockPrisma.asset.update as jest.Mock).mockResolvedValue({});

      await updateAsset("a1", { assetType: "ETF", name: "Vanguard" });

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { name: "Vanguard", assetType: "ETF" },
      });
    });
  });

  describe("deleteAsset", () => {
    it("should delete asset by id", async () => {
      (mockPrisma.asset.delete as jest.Mock).mockResolvedValue({ id: "a1" });

      await deleteAsset("a1");
      expect(mockPrisma.asset.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
    });
  });

  describe("createAsset", () => {
    it("should create an asset with all fields", async () => {
      const input = {
        portfolioId: "p1",
        symbol: "TSLA",
        name: "Tesla Inc",
        assetType: "STOCK",
        quantity: 5,
        averageBuyPrice: 200,
        currency: "USD",
        notes: "Bought on dip",
      };
      const created = { id: "a-new", ...input };
      (mockPrisma.asset.create as jest.Mock).mockResolvedValue(created);

      const result = await createAsset(input);

      expect(mockPrisma.asset.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(created);
    });
  });
});
