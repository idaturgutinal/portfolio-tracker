jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/marketData");

import { prisma } from "@/lib/prisma";
import {
  getAlertsByUser,
  getAlertsBySymbol,
  createAlert,
  deleteAlert,
  reactivateAlert,
  checkAndFireAlerts,
} from "@/services/alert.service";
import { getBatchQuotes, toMarketSymbol } from "@/services/marketData";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetBatchQuotes = getBatchQuotes as jest.MockedFunction<typeof getBatchQuotes>;
const mockToMarketSymbol = toMarketSymbol as jest.MockedFunction<typeof toMarketSymbol>;

describe("alert.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToMarketSymbol.mockImplementation((symbol, assetType) =>
      assetType === "CRYPTO" ? `${symbol.toUpperCase()}-USD` : symbol.toUpperCase()
    );
  });

  describe("getAlertsByUser", () => {
    it("should return alerts for a user with asset info", async () => {
      const alerts = [
        { id: "al1", symbol: "AAPL", condition: "ABOVE", targetPrice: 200, active: true, asset: { name: "Apple", assetType: "STOCK" } },
      ];
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue(alerts);

      const result = await getAlertsByUser("u1");

      expect(mockPrisma.priceAlert.findMany).toHaveBeenCalledWith({
        where: { userId: "u1" },
        include: { asset: { select: { name: true, assetType: true } } },
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      });
      expect(result).toEqual(alerts);
    });

    it("should return empty array when no alerts exist", async () => {
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAlertsByUser("u-empty");
      expect(result).toEqual([]);
    });
  });

  describe("getAlertsBySymbol", () => {
    it("should return alerts filtered by user and symbol", async () => {
      const alerts = [{ id: "al1", symbol: "AAPL" }];
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue(alerts);

      const result = await getAlertsBySymbol("u1", "AAPL");

      expect(mockPrisma.priceAlert.findMany).toHaveBeenCalledWith({
        where: { userId: "u1", symbol: "AAPL" },
        orderBy: [{ active: "desc" }, { createdAt: "desc" }],
      });
      expect(result).toEqual(alerts);
    });
  });

  describe("createAlert", () => {
    it("should create a price alert", async () => {
      const created = { id: "al-new", userId: "u1", symbol: "AAPL", condition: "ABOVE", targetPrice: 200 };
      (mockPrisma.priceAlert.create as jest.Mock).mockResolvedValue(created);

      const result = await createAlert("u1", {
        assetId: "a1",
        symbol: "AAPL",
        condition: "ABOVE",
        targetPrice: 200,
      });

      expect(mockPrisma.priceAlert.create).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          assetId: "a1",
          symbol: "AAPL",
          condition: "ABOVE",
          targetPrice: 200,
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe("deleteAlert", () => {
    it("should delete alert scoped by user", async () => {
      (mockPrisma.priceAlert.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await deleteAlert("al1", "u1");

      expect(mockPrisma.priceAlert.deleteMany).toHaveBeenCalledWith({
        where: { id: "al1", userId: "u1" },
      });
    });
  });

  describe("reactivateAlert", () => {
    it("should reactivate alert by resetting active and triggeredAt", async () => {
      (mockPrisma.priceAlert.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await reactivateAlert("al1", "u1");

      expect(mockPrisma.priceAlert.updateMany).toHaveBeenCalledWith({
        where: { id: "al1", userId: "u1" },
        data: { active: true, triggeredAt: null },
      });
    });
  });

  describe("checkAndFireAlerts", () => {
    it("should return empty array when no active alerts", async () => {
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue([]);

      const result = await checkAndFireAlerts("u1");
      expect(result).toEqual([]);
    });

    it("should trigger ABOVE alerts when price meets target", async () => {
      const activeAlerts = [
        {
          id: "al1",
          symbol: "AAPL",
          condition: "ABOVE",
          targetPrice: 200,
          active: true,
          asset: { assetType: "STOCK" },
        },
      ];
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue(activeAlerts);

      const quotesMap = new Map<string, { price: number }>();
      quotesMap.set("AAPL", { price: 210 } as any);
      mockGetBatchQuotes.mockResolvedValue(quotesMap as any);
      (mockPrisma.priceAlert.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await checkAndFireAlerts("u1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("al1");
      expect(result[0].currentPrice).toBe(210);
      expect(mockPrisma.priceAlert.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["al1"] } },
        data: { active: false, triggeredAt: expect.any(Date) },
      });
    });

    it("should trigger BELOW alerts when price drops below target", async () => {
      const activeAlerts = [
        {
          id: "al2",
          symbol: "TSLA",
          condition: "BELOW",
          targetPrice: 150,
          active: true,
          asset: { assetType: "STOCK" },
        },
      ];
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue(activeAlerts);

      const quotesMap = new Map<string, { price: number }>();
      quotesMap.set("TSLA", { price: 140 } as any);
      mockGetBatchQuotes.mockResolvedValue(quotesMap as any);
      (mockPrisma.priceAlert.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await checkAndFireAlerts("u1");

      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe("TSLA");
    });

    it("should not trigger when price does not meet condition", async () => {
      const activeAlerts = [
        {
          id: "al3",
          symbol: "AAPL",
          condition: "ABOVE",
          targetPrice: 300,
          active: true,
          asset: { assetType: "STOCK" },
        },
      ];
      (mockPrisma.priceAlert.findMany as jest.Mock).mockResolvedValue(activeAlerts);

      const quotesMap = new Map<string, { price: number }>();
      quotesMap.set("AAPL", { price: 180 } as any);
      mockGetBatchQuotes.mockResolvedValue(quotesMap as any);

      const result = await checkAndFireAlerts("u1");

      expect(result).toHaveLength(0);
      expect(mockPrisma.priceAlert.updateMany).not.toHaveBeenCalled();
    });
  });
});
