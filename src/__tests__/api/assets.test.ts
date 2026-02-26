jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/portfolio.service");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAsset } from "@/services/portfolio.service";
import { POST } from "@/app/api/assets/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateAsset = createAsset as jest.MockedFunction<typeof createAsset>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/assets", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validBody = {
  portfolioId: "p1",
  symbol: "AAPL",
  name: "Apple Inc",
  assetType: "STOCK",
  quantity: 10,
  averageBuyPrice: 150,
  currency: "USD",
};

describe("POST /api/assets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("should return 400 when required fields are missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makeRequest({ portfolioId: "p1", symbol: "AAPL" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing required fields.");
  });

  it("should return 400 for invalid asset type", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makeRequest({ ...validBody, assetType: "INVALID" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid asset type.");
  });

  it("should return 400 for non-positive quantity", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makeRequest({ ...validBody, quantity: -1 }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("positive number");
  });

  it("should return 404 when portfolio not found (ownership check)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Portfolio not found.");
  });

  it("should create asset and return 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue({ id: "p1" });
    const created = { id: "a-new", ...validBody };
    mockCreateAsset.mockResolvedValue(created as any);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(created);
  });
});
