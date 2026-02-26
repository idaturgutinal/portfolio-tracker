import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUserId, unauthorizedResponse, badRequest, notFound, tooManyRequests, serverError } from "@/lib/api-utils";
import { getUserById, updateUserPassword } from "@/services/user.service";
import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  // Rate limit: 5 password change attempts per user per hour
  const rl = rateLimit(`change-password:${userId}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return tooManyRequests();
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (typeof newPassword !== "string" || !newPassword) {
      return badRequest("New password is required.");
    }
    if (newPassword.length < 8) {
      return badRequest("New password must be at least 8 characters.");
    }
    if (newPassword.length > 128) {
      return badRequest("New password is too long.");
    }

    const user = await getUserById(userId);
    if (!user) {
      return notFound("User not found.");
    }

    if (!user.password) {
      // Google-only user setting a password for the first time
      // No currentPassword required
      const hash = await bcrypt.hash(newPassword, 12);
      await updateUserPassword(userId, hash);
      return NextResponse.json({ success: true });
    }

    // Existing password user — verify current password
    if (typeof currentPassword !== "string" || !currentPassword) {
      return badRequest("Current password is required.");
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return badRequest("Current password is incorrect.");
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(userId, hash);

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
