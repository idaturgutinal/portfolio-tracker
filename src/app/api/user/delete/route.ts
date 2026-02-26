import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUserId, unauthorizedResponse, badRequest, notFound, tooManyRequests, serverError } from "@/lib/api-utils";
import { getUserById, deleteUserAccount } from "@/services/user.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  // Rate limit: 5 deletion attempts per user per hour
  const rl = rateLimit(`delete-account:${userId}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return tooManyRequests(undefined, rl.resetAt - Date.now());
  }

  // Also rate limit by IP
  const ip = getClientIp(req);
  const ipRl = rateLimit(`delete-account-ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipRl.allowed) {
    return tooManyRequests(undefined, ipRl.resetAt - Date.now());
  }

  try {
    const body = await req.json();
    const { password, confirmation } = body as { password?: unknown; confirmation?: unknown };

    const user = await getUserById(userId);
    if (!user) {
      return notFound("User not found.");
    }

    if (user.password) {
      // Email/password user — verify password
      if (typeof password !== "string" || !password) {
        return badRequest("Password is required.");
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return badRequest("Incorrect password.");
      }
    } else {
      // OAuth user (no password) — require typing "DELETE"
      if (confirmation !== "DELETE") {
        return badRequest("Type DELETE to confirm.");
      }
    }

    await deleteUserAccount(userId);
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
