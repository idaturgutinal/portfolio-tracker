import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { email } = body as { email?: unknown };

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Always return success to prevent email enumeration
    const ok = { ok: true } as const;

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // No user or Google-only user (no password) — silently succeed
    if (!user || !user.password) {
      return NextResponse.json(ok);
    }

    // Generate token and save
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email first
    await prisma.passwordReset.deleteMany({ where: { email: normalizedEmail } });

    await prisma.passwordReset.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(normalizedEmail, resetUrl);

    return NextResponse.json(ok);
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
