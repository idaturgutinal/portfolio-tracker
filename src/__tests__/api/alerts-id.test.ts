jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/alert.service");

import { auth } from "@/lib/auth";
import { deleteAlert, reactivateAlert } from "@/services/alert.service";
import { DELETE, PATCH } from "@/app/api/alerts/[id]/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDeleteAlert = deleteAlert as jest.MockedFunction<typeof deleteAlert>;
const mockReactivateAlert = reactivateAlert as jest.MockedFunction<typeof reactivateAlert>;

const params = Promise.resolve({ id: "al1" });

function makeRequest(method: string) {
  return new NextRequest(`http://localhost:3000/api/alerts/al1`, { method });
}

describe("DELETE /api/alerts/[id]", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(401);
  });

  it("should delete alert and return 204", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockDeleteAlert.mockResolvedValue({ count: 1 } as any);

    const res = await DELETE(makeRequest("DELETE"), { params });

    expect(res.status).toBe(204);
    expect(mockDeleteAlert).toHaveBeenCalledWith("al1", "u1");
  });

  it("should still return 204 even if alert didn't exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockDeleteAlert.mockResolvedValue({ count: 0 } as any);

    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(204);
  });
});

describe("PATCH /api/alerts/[id]", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await PATCH(makeRequest("PATCH"), { params });
    expect(res.status).toBe(401);
  });

  it("should reactivate alert and return success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockReactivateAlert.mockResolvedValue({ count: 1 } as any);

    const res = await PATCH(makeRequest("PATCH"), { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockReactivateAlert).toHaveBeenCalledWith("al1", "u1");
  });
});
