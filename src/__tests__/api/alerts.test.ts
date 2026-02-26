jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/alert.service");

import { auth } from "@/lib/auth";
import { getAlertsByUser, createAlert } from "@/services/alert.service";
import { GET, POST } from "@/app/api/alerts/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetAlerts = getAlertsByUser as jest.MockedFunction<typeof getAlertsByUser>;
const mockCreateAlert = createAlert as jest.MockedFunction<typeof createAlert>;

function makePostRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/alerts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/alerts", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should return alerts for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const alerts = [{ id: "al1", symbol: "AAPL" }];
    mockGetAlerts.mockResolvedValue(alerts as any);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(alerts);
  });

  it("should return empty array when no alerts exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetAlerts.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(json).toEqual([]);
  });
});

describe("POST /api/alerts", () => {
  it("should return 400 when required fields are missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(makePostRequest({ symbol: "AAPL" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing required fields.");
  });

  it("should return 400 for invalid condition", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(
      makePostRequest({
        assetId: "a1",
        symbol: "AAPL",
        condition: "INVALID",
        targetPrice: 200,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("ABOVE or BELOW");
  });

  it("should return 400 for non-positive target price", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await POST(
      makePostRequest({
        assetId: "a1",
        symbol: "AAPL",
        condition: "ABOVE",
        targetPrice: -5,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("positive number");
  });

  it("should create alert and return 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const created = { id: "al-new", symbol: "AAPL", condition: "ABOVE", targetPrice: 200 };
    mockCreateAlert.mockResolvedValue(created as any);

    const res = await POST(
      makePostRequest({
        assetId: "a1",
        symbol: "AAPL",
        condition: "ABOVE",
        targetPrice: 200,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toEqual(created);
  });
});
