jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/portfolio.service");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAsset, deleteAsset } from "@/services/portfolio.service";
import { PATCH, DELETE } from "@/app/api/assets/[id]/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUpdateAsset = updateAsset as jest.MockedFunction<typeof updateAsset>;
const mockDeleteAsset = deleteAsset as jest.MockedFunction<typeof deleteAsset>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const params = Promise.resolve({ id: "a1" });

function makePatchRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/assets/a1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeDeleteRequest() {
  return new NextRequest("http://localhost:3000/api/assets/a1", { method: "DELETE" });
}

describe("PATCH /api/assets/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await PATCH(makePatchRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("should return 404 when asset not owned by user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await PATCH(makePatchRequest({ name: "Updated" }), { params });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Asset not found.");
  });

  it("should return 400 for invalid asset type", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue({ id: "a1" });

    const res = await PATCH(makePatchRequest({ assetType: "INVALID" }), { params });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid asset type.");
  });

  it("should update asset and return updated data", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue({ id: "a1" });
    const updated = { id: "a1", name: "Apple Updated" };
    mockUpdateAsset.mockResolvedValue(updated as any);

    const res = await PATCH(makePatchRequest({ name: "Apple Updated" }), { params });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(updated);
  });
});

describe("DELETE /api/assets/[id]", () => {
  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(401);
  });

  it("should return 404 when asset not owned by user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await DELETE(makeDeleteRequest(), { params });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Asset not found.");
  });

  it("should delete asset and return 204", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValue({ id: "a1" });
    mockDeleteAsset.mockResolvedValue({} as any);

    const res = await DELETE(makeDeleteRequest(), { params });

    expect(res.status).toBe(204);
    expect(mockDeleteAsset).toHaveBeenCalledWith("a1");
  });
});
