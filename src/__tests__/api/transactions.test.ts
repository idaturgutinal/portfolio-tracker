jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/transaction.service");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/services/transaction.service";
import { POST } from "@/app/api/transactions/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateTransaction = createTransaction as jest.MockedFunction<typeof createTransaction>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/transactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await POST(makeRequest({ assetId: "a1", type: "BUY", quantity: 10, pricePerUnit: 100, date: "2024-01-15" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 when required fields are missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makeRequest({ assetId: "a1" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing required fields.");
  });

  it("should return 400 for invalid transaction type", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(
      makeRequest({
        assetId: "a1",
        type: "INVALID",
        quantity: 10,
        pricePerUnit: 100,
        date: "2024-01-15",
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid transaction type");
  });

  it("should return 400 for non-positive quantity", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(
      makeRequest({
        assetId: "a1",
        type: "BUY",
        quantity: -5,
        pricePerUnit: 100,
        date: "2024-01-15",
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("positive number");
  });

  it("should return 404 when asset not found (ownership check)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await POST(
      makeRequest({
        assetId: "a-nonexistent",
        type: "BUY",
        quantity: 10,
        pricePerUnit: 100,
        date: "2024-01-15",
      })
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Asset not found.");
  });

  it("should return 400 for SELL with insufficient quantity", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue({
      id: "a1",
      quantity: 5,
    });

    const res = await POST(
      makeRequest({
        assetId: "a1",
        type: "SELL",
        quantity: 10,
        pricePerUnit: 100,
        date: "2024-01-15",
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Insufficient quantity");
  });

  it("should create transaction and return 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue({
      id: "a1",
      quantity: 100,
    });
    const created = { id: "t-new", type: "BUY", quantity: 10, pricePerUnit: 100 };
    mockCreateTransaction.mockResolvedValue(created as any);

    const res = await POST(
      makeRequest({
        assetId: "a1",
        type: "BUY",
        quantity: 10,
        pricePerUnit: 100,
        date: "2024-01-15",
      })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(created);
  });
});
