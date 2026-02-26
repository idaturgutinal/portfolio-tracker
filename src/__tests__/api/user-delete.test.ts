jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/user.service");
jest.mock("bcryptjs");
jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 4, resetAt: Date.now() + 3600000 }),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

import { auth } from "@/lib/auth";
import { getUserById, deleteUserAccount } from "@/services/user.service";
import bcrypt from "bcryptjs";
import { DELETE } from "@/app/api/user/delete/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetUser = getUserById as jest.MockedFunction<typeof getUserById>;
const mockDeleteAccount = deleteUserAccount as jest.MockedFunction<typeof deleteUserAccount>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/user/delete", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("DELETE /api/user/delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await DELETE(makeRequest({ password: "test" }));
    expect(res.status).toBe(401);
  });

  it("should return 404 when user not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue(null);

    const res = await DELETE(makeRequest({ password: "test" }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("User not found.");
  });

  it("should return 400 for password user without password provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: "$2a$12$hash" } as any);

    const res = await DELETE(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Password is required");
  });

  it("should return 400 for incorrect password", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: "$2a$12$hash" } as any);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false as never);

    const res = await DELETE(makeRequest({ password: "wrong" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Incorrect password");
  });

  it("should delete password user account with correct password", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: "$2a$12$hash" } as any);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true as never);
    mockDeleteAccount.mockResolvedValue({} as any);

    const res = await DELETE(makeRequest({ password: "correct" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockDeleteAccount).toHaveBeenCalledWith("u1");
  });

  it("should return 400 for OAuth user without DELETE confirmation", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: null } as any);

    const res = await DELETE(makeRequest({ confirmation: "nope" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Type DELETE");
  });

  it("should delete OAuth user account with DELETE confirmation", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: null } as any);
    mockDeleteAccount.mockResolvedValue({} as any);

    const res = await DELETE(makeRequest({ confirmation: "DELETE" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
