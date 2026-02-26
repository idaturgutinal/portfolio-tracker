jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/portfolio.service");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePortfolio } from "@/services/portfolio.service";
import { DELETE } from "@/app/api/portfolios/[id]/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDeletePortfolio = deletePortfolio as jest.MockedFunction<typeof deletePortfolio>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest() {
  return new NextRequest("http://localhost:3000/api/portfolios/p1", { method: "DELETE" });
}

const params = Promise.resolve({ id: "p1" });

describe("DELETE /api/portfolios/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await DELETE(makeRequest(), { params });
    expect(res.status).toBe(401);
  });

  it("should return 404 when portfolio not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(makeRequest(), { params });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Portfolio not found.");
  });

  it("should return 400 when portfolio still has assets", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue({
      id: "p1",
      _count: { assets: 3 },
    });

    const res = await DELETE(makeRequest(), { params });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("still has assets");
  });

  it("should delete empty portfolio and return 204", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.portfolio.findFirst as jest.Mock).mockResolvedValue({
      id: "p1",
      _count: { assets: 0 },
    });
    mockDeletePortfolio.mockResolvedValue({} as any);

    const res = await DELETE(makeRequest(), { params });

    expect(res.status).toBe(204);
    expect(mockDeletePortfolio).toHaveBeenCalledWith("p1");
  });
});
