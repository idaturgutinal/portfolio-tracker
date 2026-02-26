jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

import { prisma } from "@/lib/prisma";
import {
  getTransactionsByUser,
  getTransactions,
  createTransaction,
} from "@/services/transaction.service";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("transaction.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTransactionsByUser", () => {
    it("should return all transactions for user across portfolios", async () => {
      const mockTxns = [
        {
          id: "t1",
          type: "BUY",
          quantity: 10,
          pricePerUnit: 150,
          asset: { symbol: "AAPL", portfolio: { id: "p1", name: "Main" } },
        },
      ];
      (mockPrisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTxns);

      const result = await getTransactionsByUser("u1");

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { asset: { portfolio: { userId: "u1" } } },
        include: {
          asset: {
            include: { portfolio: { select: { id: true, name: true } } },
          },
        },
        orderBy: { date: "desc" },
      });
      expect(result).toEqual(mockTxns);
    });

    it("should return empty array when no transactions exist", async () => {
      (mockPrisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTransactionsByUser("u-empty");
      expect(result).toEqual([]);
    });
  });

  describe("getTransactions", () => {
    it("should return transactions for a specific asset", async () => {
      const mockTxns = [
        { id: "t1", assetId: "a1", type: "BUY", quantity: 10, pricePerUnit: 100 },
      ];
      (mockPrisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTxns);

      const result = await getTransactions("a1");

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { assetId: "a1" },
        orderBy: { date: "desc" },
      });
      expect(result).toEqual(mockTxns);
    });
  });

  describe("createTransaction", () => {
    it("should create a BUY transaction and update asset quantity/average", async () => {
      const txCreated = {
        id: "t-new",
        assetId: "a1",
        type: "BUY",
        quantity: 5,
        pricePerUnit: 200,
        fees: 10,
        date: new Date("2024-01-15"),
      };
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue(txCreated);
      (mockPrisma.asset.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: "a1",
        quantity: 10,
        averageBuyPrice: 150,
      });
      (mockPrisma.asset.update as jest.Mock).mockResolvedValue({});

      const input = {
        assetId: "a1",
        type: "BUY",
        quantity: 5,
        pricePerUnit: 200,
        fees: 10,
        date: "2024-01-15",
      };
      const result = await createTransaction(input);

      expect(result).toEqual(txCreated);
      // New qty: 10 + 5 = 15, new avg: (10*150 + 5*200) / 15 = 2500/15 ≈ 166.67
      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: {
          quantity: 15,
          averageBuyPrice: (10 * 150 + 5 * 200) / 15,
        },
      });
    });

    it("should create a SELL transaction and decrement quantity", async () => {
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: "t2" });
      (mockPrisma.asset.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: "a1",
        quantity: 10,
        averageBuyPrice: 150,
      });
      (mockPrisma.asset.update as jest.Mock).mockResolvedValue({});

      await createTransaction({
        assetId: "a1",
        type: "SELL",
        quantity: 3,
        pricePerUnit: 180,
        date: "2024-01-15",
      });

      expect(mockPrisma.asset.update).toHaveBeenCalledWith({
        where: { id: "a1" },
        data: { quantity: { decrement: 3 } },
      });
    });

    it("should throw error when selling more than held quantity", async () => {
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: "t3" });
      (mockPrisma.asset.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: "a1",
        quantity: 2,
        averageBuyPrice: 150,
      });

      await expect(
        createTransaction({
          assetId: "a1",
          type: "SELL",
          quantity: 5,
          pricePerUnit: 180,
          date: "2024-01-15",
        })
      ).rejects.toThrow("Insufficient quantity");
    });

    it("should not update asset for DIVIDEND transactions", async () => {
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: "t4" });

      await createTransaction({
        assetId: "a1",
        type: "DIVIDEND",
        quantity: 1,
        pricePerUnit: 5,
        date: "2024-01-15",
      });

      expect(mockPrisma.asset.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(mockPrisma.asset.update).not.toHaveBeenCalled();
    });
  });
});
