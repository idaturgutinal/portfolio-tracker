jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));

import { prisma } from "@/lib/prisma";
import {
  getUserById,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
  getUserExportData,
  getUserAssetsFlat,
  getUserTransactionsFlat,
} from "@/services/user.service";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("user.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const user = { id: "u1", name: "Test User", email: "test@example.com" };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await getUserById("u1");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "u1" } });
      expect(result).toEqual(user);
    });

    it("should return null for non-existent user", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile with hasPassword true when password exists", async () => {
      const now = new Date();
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "u1",
        name: "John",
        email: "john@example.com",
        defaultCurrency: "USD",
        createdAt: now,
        password: "$2a$12$hash",
      });

      const result = await getUserProfile("u1");

      expect(result).toMatchObject({
        id: "u1",
        name: "John",
        email: "john@example.com",
        defaultCurrency: "USD",
        createdAt: now.toISOString(),
        hasPassword: true,
      });
    });

    it("should return hasPassword false for OAuth user", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "u2",
        name: "OAuth User",
        email: "oauth@example.com",
        defaultCurrency: "EUR",
        createdAt: new Date(),
        password: null,
      });

      const result = await getUserProfile("u2");
      expect(result!.hasPassword).toBe(false);
    });

    it("should return null for non-existent user", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserProfile("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile fields", async () => {
      const updated = { id: "u1", name: "New Name", email: "new@example.com" };
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(updated);

      const result = await updateUserProfile("u1", { name: "New Name" });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { name: "New Name" },
      });
      expect(result).toEqual(updated);
    });
  });

  describe("updateUserPassword", () => {
    it("should update user password hash", async () => {
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});

      await updateUserPassword("u1", "$2a$12$newhash");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { password: "$2a$12$newhash" },
      });
    });
  });

  describe("deleteUserAccount", () => {
    it("should delete user by id", async () => {
      (mockPrisma.user.delete as jest.Mock).mockResolvedValue({ id: "u1" });

      await deleteUserAccount("u1");

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    });
  });

  describe("getUserExportData", () => {
    it("should return full user data with nested portfolios/assets/transactions", async () => {
      const exportData = {
        id: "u1",
        name: "Test User",
        email: "test@example.com",
        defaultCurrency: "USD",
        createdAt: new Date(),
        portfolios: [
          {
            id: "p1",
            name: "Main",
            createdAt: new Date(),
            assets: [
              {
                id: "a1",
                symbol: "AAPL",
                name: "Apple",
                assetType: "STOCK",
                quantity: 10,
                averageBuyPrice: 150,
                currency: "USD",
                notes: null,
                createdAt: new Date(),
                transactions: [{ id: "t1", type: "BUY", quantity: 10, pricePerUnit: 150, fees: 0, date: new Date(), notes: null }],
              },
            ],
          },
        ],
      };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(exportData);

      const result = await getUserExportData("u1");
      expect(result).toEqual(exportData);
    });
  });

  describe("getUserAssetsFlat", () => {
    it("should flatten assets across portfolios with portfolioName", async () => {
      (mockPrisma.portfolio.findMany as jest.Mock).mockResolvedValue([
        {
          name: "Portfolio A",
          assets: [
            { id: "a1", symbol: "AAPL", name: "Apple", assetType: "STOCK", quantity: 10, averageBuyPrice: 150, currency: "USD", notes: null, createdAt: new Date() },
          ],
        },
        {
          name: "Portfolio B",
          assets: [
            { id: "a2", symbol: "GOOGL", name: "Google", assetType: "STOCK", quantity: 5, averageBuyPrice: 2800, currency: "USD", notes: null, createdAt: new Date() },
          ],
        },
      ]);

      const result = await getUserAssetsFlat("u1");

      expect(result).toHaveLength(2);
      expect(result[0].portfolioName).toBe("Portfolio A");
      expect(result[1].portfolioName).toBe("Portfolio B");
    });
  });

  describe("getUserTransactionsFlat", () => {
    it("should return flat transaction list with asset and portfolio info", async () => {
      const txns = [
        {
          id: "t1",
          type: "BUY",
          quantity: 10,
          pricePerUnit: 150,
          fees: 0,
          date: new Date(),
          notes: null,
          asset: { symbol: "AAPL", name: "Apple", portfolio: { name: "Main" } },
        },
      ];
      (mockPrisma.transaction.findMany as jest.Mock).mockResolvedValue(txns);

      const result = await getUserTransactionsFlat("u1");
      expect(result).toEqual(txns);
    });
  });
});
