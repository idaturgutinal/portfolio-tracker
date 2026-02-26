import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { badRequest, serverError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { token, newPassword } = body as {
      token?: unknown;
      newPassword?: unknown;
    };

    if (typeof token !== "string" || !token.trim()) {
      return badRequest("Token is required.");
    }
    if (typeof newPassword !== "string" || !newPassword) {
      return badRequest("New password is required.");
    }
    if (newPassword.length < 8) {
      return badRequest("Password must be at least 8 characters.");
    }
    if (newPassword.length > 128) {
      return badRequest("Password is too long.");
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: token.trim() },
    });

    if (!resetRecord) {
      return badRequest("Invalid or expired reset link.");
    }

    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return badRequest("This reset link has expired. Please request a new one.");
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hash },
    });

    // Delete all reset tokens for this email
    await prisma.passwordReset.deleteMany({
      where: { email: resetRecord.email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return serverError();
  }
}
