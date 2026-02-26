jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/marketData");

import { auth } from "@/lib/auth";
import { getQuote } from "@/services/marketData";
import { GET } from "@/app/api/market/quote/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetQuote = getQuote as jest.MockedFunction<typeof getQuote>;

function makeRequest(symbol?: string) {
  const url = symbol
    ? `http://localhost:3000/api/market/quote?symbol=${encodeURIComponent(symbol)}`
    : "http://localhost:3000/api/market/quote";
  return new NextRequest(url);
}

describe("GET /api/market/quote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await GET(makeRequest("AAPL"));
    expect(res.status).toBe(401);
  });

  it("should return 400 when symbol is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await GET(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("symbol");
  });

  it("should return 400 when symbol is too long", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await GET(makeRequest("A".repeat(21)));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("too long");
  });

  it("should return 502 when quote data is unavailable", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetQuote.mockResolvedValue({ data: null, error: "Service unavailable", stale: false });

    const res = await GET(makeRequest("INVALID"));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Service unavailable");
  });

  it("should return quote data with cache header", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const quoteData = {
      symbol: "AAPL",
      price: 180,
      currency: "USD",
      change: 2.5,
      changePercent: 0.014,
      timestamp: 1700000000,
    };
    mockGetQuote.mockResolvedValue({ data: quoteData, error: null, stale: false });

    const res = await GET(makeRequest("AAPL"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual(quoteData);
    expect(res.headers.get("X-Cache")).toBe("MISS");
  });

  it("should return STALE cache header when data is stale", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetQuote.mockResolvedValue({
      data: { symbol: "AAPL", price: 170 } as any,
      error: "Refresh failed",
      stale: true,
    });

    const res = await GET(makeRequest("AAPL"));

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBe("STALE");
  });
});
