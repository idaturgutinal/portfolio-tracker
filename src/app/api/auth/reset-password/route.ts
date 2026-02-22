import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }
    if (typeof newPassword !== "string" || !newPassword) {
      return NextResponse.json({ error: "New password is required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (newPassword.length > 128) {
      return NextResponse.json({ error: "Password is too long." }, { status: 400 });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: token.trim() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
