jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => require("@/__mocks__/prisma"));
jest.mock("@/services/user.service");

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserProfile } from "@/services/user.service";
import { PATCH } from "@/app/api/user/profile/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("PATCH /api/user/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await PATCH(makeRequest({ name: "New Name" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 for empty name", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await PATCH(makeRequest({ name: "" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("empty");
  });

  it("should return 400 for invalid email format", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await PATCH(makeRequest({ email: "not-an-email" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("valid email");
  });

  it("should return 409 when email already in use by another user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "u2" });

    const res = await PATCH(makeRequest({ email: "existing@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("already in use");
  });

  it("should return 400 for unsupported currency", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await PATCH(makeRequest({ defaultCurrency: "INVALID" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Unsupported currency");
  });

  it("should return 400 when no fields to update", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await PATCH(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("No fields");
  });

  it("should update name and return updated profile", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    const updated = { id: "u1", name: "New Name", email: "test@example.com", defaultCurrency: "USD" };
    mockUpdateUserProfile.mockResolvedValue(updated as any);

    const res = await PATCH(makeRequest({ name: "New Name" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.name).toBe("New Name");
  });

  it("should update email after conflict check passes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null); // no conflict
    const updated = { id: "u1", name: "Test", email: "new@example.com", defaultCurrency: "USD" };
    mockUpdateUserProfile.mockResolvedValue(updated as any);

    const res = await PATCH(makeRequest({ email: "new@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.email).toBe("new@example.com");
  });
});
