jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/watchlist.service");

import { auth } from "@/lib/auth";
import { getWatchlistByUser, addToWatchlist } from "@/services/watchlist.service";
import { GET, POST } from "@/app/api/watchlist/route";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetWatchlist = getWatchlistByUser as jest.MockedFunction<typeof getWatchlistByUser>;
const mockAddToWatchlist = addToWatchlist as jest.MockedFunction<typeof addToWatchlist>;

function makePostRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/watchlist", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/watchlist", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should return watchlist items", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const items = [{ id: "w1", symbol: "AAPL" }];
    mockGetWatchlist.mockResolvedValue(items as any);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(items);
  });

  it("should return empty array when no items", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetWatchlist.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([]);
  });
});

describe("POST /api/watchlist", () => {
  it("should return 400 for missing symbol", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makePostRequest({ name: "Apple", assetType: "STOCK" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("symbol");
  });

  it("should return 400 for missing name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makePostRequest({ symbol: "AAPL", assetType: "STOCK" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Name");
  });

  it("should return 400 for missing assetType", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makePostRequest({ symbol: "AAPL", name: "Apple" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Asset type");
  });

  it("should create watchlist item and return 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const created = { id: "w-new", symbol: "AAPL", name: "Apple", assetType: "STOCK" };
    mockAddToWatchlist.mockResolvedValue(created as any);

    const res = await POST(
      makePostRequest({ symbol: "AAPL", name: "Apple", assetType: "STOCK" })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(created);
  });

  it("should return 409 for duplicate symbol (P2002)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "5.0.0",
    });
    mockAddToWatchlist.mockRejectedValue(error);

    const res = await POST(
      makePostRequest({ symbol: "AAPL", name: "Apple", assetType: "STOCK" })
    );
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("already in your watchlist");
  });
});
