jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/services/user.service");
jest.mock("bcryptjs");
jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 4, resetAt: Date.now() + 3600000 }),
}));

import { auth } from "@/lib/auth";
import { getUserById, updateUserPassword } from "@/services/user.service";
import bcrypt from "bcryptjs";
import { PATCH } from "@/app/api/user/password/route";
import { NextRequest } from "next/server";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetUser = getUserById as jest.MockedFunction<typeof getUserById>;
const mockUpdatePassword = updateUserPassword as jest.MockedFunction<typeof updateUserPassword>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/user/password", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("PATCH /api/user/password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as any);

    const res = await PATCH(makeRequest({ newPassword: "newpass123" }));
    expect(res.status).toBe(401);
  });

  it("should return 400 when new password is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await PATCH(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("New password is required");
  });

  it("should return 400 when password is too short", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);

    const res = await PATCH(makeRequest({ newPassword: "short" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("at least 8 characters");
  });

  it("should allow Google-only user to set password without currentPassword", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: null } as any);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("$2a$12$newhash");
    mockUpdatePassword.mockResolvedValue({} as any);

    const res = await PATCH(makeRequest({ newPassword: "newpassword123" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("should return 400 when currentPassword is missing for password user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: "$2a$12$oldhash" } as any);

    const res = await PATCH(makeRequest({ newPassword: "newpassword123" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Current password is required");
  });

  it("should return 400 when current password is incorrect", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: "$2a$12$oldhash" } as any);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false as never);

    const res = await PATCH(
      makeRequest({ currentPassword: "wrong", newPassword: "newpassword123" })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("incorrect");
  });

  it("should change password when current password is correct", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetUser.mockResolvedValue({ id: "u1", password: "$2a$12$oldhash" } as any);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true as never);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("$2a$12$newhash");
    mockUpdatePassword.mockResolvedValue({} as any);

    const res = await PATCH(
      makeRequest({ currentPassword: "correct", newPassword: "newpassword123" })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockUpdatePassword).toHaveBeenCalledWith("u1", "$2a$12$newhash");
  });
});
