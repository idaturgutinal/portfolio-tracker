jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/user.service");

import { auth } from "@/lib/auth";
import { getUserExportData, getUserAssetsFlat, getUserTransactionsFlat } from "@/services/user.service";
import { GET } from "@/app/api/user/export/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetExport = getUserExportData as jest.MockedFunction<typeof getUserExportData>;
const mockGetAssetsFlat = getUserAssetsFlat as jest.MockedFunction<typeof getUserAssetsFlat>;
const mockGetTxnFlat = getUserTransactionsFlat as jest.MockedFunction<typeof getUserTransactionsFlat>;

function makeRequest(format: string) {
  return new NextRequest(`http://localhost:3000/api/user/export?format=${format}`);
}

describe("GET /api/user/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await GET(makeRequest("json"));
    expect(res.status).toBe(401);
  });

  it("should return 400 for invalid format", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await GET(makeRequest("xml"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid format");
  });

  it("should return JSON export with correct headers", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const data = { id: "u1", name: "Test", portfolios: [] };
    mockGetExport.mockResolvedValue(data as any);

    const res = await GET(makeRequest("json"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Content-Disposition")).toContain("portfolio-export");
  });

  it("should return CSV assets export", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetAssetsFlat.mockResolvedValue([
      {
        portfolioName: "Main",
        symbol: "AAPL",
        name: "Apple",
        assetType: "STOCK",
        quantity: 10,
        averageBuyPrice: 150,
        currency: "USD",
        notes: null,
        createdAt: new Date("2024-01-15"),
      },
    ] as any);

    const res = await GET(makeRequest("csv-assets"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Portfolio");
    expect(text).toContain("AAPL");
  });

  it("should return CSV transactions export", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetTxnFlat.mockResolvedValue([
      {
        id: "t1",
        type: "BUY",
        quantity: 10,
        pricePerUnit: 150,
        fees: 5,
        date: new Date("2024-01-15"),
        notes: null,
        asset: { symbol: "AAPL", name: "Apple", portfolio: { name: "Main" } },
      },
    ] as any);

    const res = await GET(makeRequest("csv-transactions"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Date");
    expect(text).toContain("AAPL");
  });
});
