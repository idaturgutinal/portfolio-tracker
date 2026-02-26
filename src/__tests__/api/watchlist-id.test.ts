jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/watchlist.service");

import { auth } from "@/lib/auth";
import { removeFromWatchlist } from "@/services/watchlist.service";
import { DELETE } from "@/app/api/watchlist/[id]/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockRemove = removeFromWatchlist as jest.MockedFunction<typeof removeFromWatchlist>;

const params = Promise.resolve({ id: "w1" });

describe("DELETE /api/watchlist/[id]", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await DELETE(
      new NextRequest("http://localhost:3000/api/watchlist/w1", { method: "DELETE" }),
      { params }
    );
    expect(res.status).toBe(401);
  });

  it("should delete watchlist item and return 204", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockRemove.mockResolvedValue({ count: 1 } as any);

    const res = await DELETE(
      new NextRequest("http://localhost:3000/api/watchlist/w1", { method: "DELETE" }),
      { params }
    );

    expect(res.status).toBe(204);
    expect(mockRemove).toHaveBeenCalledWith("w1", "u1");
  });

  it("should return 204 even if item did not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockRemove.mockResolvedValue({ count: 0 } as any);

    const res = await DELETE(
      new NextRequest("http://localhost:3000/api/watchlist/w1", { method: "DELETE" }),
      { params }
    );
    expect(res.status).toBe(204);
  });
});
