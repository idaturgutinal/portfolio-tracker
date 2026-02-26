jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/portfolio.service");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfolios, createPortfolio } from "@/services/portfolio.service";
import { GET, POST } from "@/app/api/portfolios/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetPortfolios = getPortfolios as jest.MockedFunction<typeof getPortfolios>;
const mockCreatePortfolio = createPortfolio as jest.MockedFunction<typeof createPortfolio>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body?: object) {
  return new NextRequest("http://localhost:3000/api/portfolios", {
    method: body ? "POST" : "GET",
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "Content-Type": "application/json" } : {},
  });
}

describe("GET /api/portfolios", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
  });

  it("should return portfolios for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const portfolios = [{ id: "p1", name: "Main" }];
    mockGetPortfolios.mockResolvedValue(portfolios as any);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(portfolios);
  });

  it("should return empty array when user has no portfolios", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetPortfolios.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([]);
  });
});

describe("POST /api/portfolios", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await POST(makeRequest({ name: "Test" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 when name is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makeRequest({ name: "" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Portfolio name is required.");
  });

  it("should return 409 when portfolio name already exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue({ id: "existing" });

    const res = await POST(makeRequest({ name: "Existing Portfolio" }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("already exists");
  });

  it("should create portfolio and return 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue(null);
    const created = { id: "p-new", name: "New Portfolio", userId: "u1" };
    mockCreatePortfolio.mockResolvedValue(created as any);

    const res = await POST(makeRequest({ name: "New Portfolio" }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(created);
  });
});
