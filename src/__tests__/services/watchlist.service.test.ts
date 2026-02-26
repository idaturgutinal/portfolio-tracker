jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

import { prisma } from "@/lib/prisma";
import {
  getWatchlistByUser,
  addToWatchlist,
  removeFromWatchlist,
} from "@/services/watchlist.service";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("watchlist.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWatchlistByUser", () => {
    it("should return watchlist items ordered by addedAt desc", async () => {
      const items = [
        { id: "w1", userId: "u1", symbol: "AAPL", name: "Apple", assetType: "STOCK", addedAt: new Date() },
        { id: "w2", userId: "u1", symbol: "GOOGL", name: "Google", assetType: "STOCK", addedAt: new Date() },
      ];
      (mockPrisma.watchlistItem.findMany as jest.Mock).mockResolvedValue(items);

      const result = await getWatchlistByUser("u1");

      expect(mockPrisma.watchlistItem.findMany).toHaveBeenCalledWith({
        where: { userId: "u1" },
        orderBy: { addedAt: "desc" },
      });
      expect(result).toEqual(items);
    });

    it("should return empty array for user with no watchlist items", async () => {
      (mockPrisma.watchlistItem.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getWatchlistByUser("u-empty");
      expect(result).toEqual([]);
    });
  });

  describe("addToWatchlist", () => {
    it("should create a watchlist item with trimmed/uppercased symbol", async () => {
      const created = {
        id: "w-new",
        userId: "u1",
        symbol: "AAPL",
        name: "Apple Inc",
        assetType: "STOCK",
        notes: null,
      };
      (mockPrisma.watchlistItem.create as jest.Mock).mockResolvedValue(created);

      const result = await addToWatchlist("u1", {
        symbol: " aapl ",
        name: " Apple Inc ",
        assetType: "STOCK",
      });

      expect(mockPrisma.watchlistItem.create).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          symbol: "AAPL",
          name: "Apple Inc",
          assetType: "STOCK",
          notes: null,
        },
      });
      expect(result).toEqual(created);
    });

    it("should save notes when provided", async () => {
      (mockPrisma.watchlistItem.create as jest.Mock).mockResolvedValue({});

      await addToWatchlist("u1", {
        symbol: "BTC",
        name: "Bitcoin",
        assetType: "CRYPTO",
        notes: " Watch for dip ",
      });

      expect(mockPrisma.watchlistItem.create).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          symbol: "BTC",
          name: "Bitcoin",
          assetType: "CRYPTO",
          notes: "Watch for dip",
        },
      });
    });
  });

  describe("removeFromWatchlist", () => {
    it("should delete watchlist item scoped by user", async () => {
      (mockPrisma.watchlistItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await removeFromWatchlist("w1", "u1");

      expect(mockPrisma.watchlistItem.deleteMany).toHaveBeenCalledWith({
        where: { id: "w1", userId: "u1" },
      });
    });

    it("should not throw when item does not exist", async () => {
      (mockPrisma.watchlistItem.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(removeFromWatchlist("nonexistent", "u1")).resolves.not.toThrow();
    });
  });
});
