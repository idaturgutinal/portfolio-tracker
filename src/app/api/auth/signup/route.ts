import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { badRequest, conflictResponse, serverError } from "@/lib/api-utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`signup:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, code } = body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
      code?: unknown;
    };

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof code !== "string"
    ) {
      return badRequest("Invalid request body.");
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!trimmedName) return badRequest("Name is required.");
    if (trimmedName.length > 100) return badRequest("Name must be 100 characters or fewer.");
    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) return badRequest("A valid email address is required.");
    if (!password || password.length < 8) return badRequest("Password must be at least 8 characters.");
    if (password.length > 128) return badRequest("Password is too long.");
    if (!trimmedCode) return badRequest("Verification code is required.");

    // Verify the email code
    const verification = await prisma.emailVerification.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return badRequest("No verification code found. Please request a new code.");
    }

    if (new Date() > verification.expiresAt) {
      await prisma.emailVerification.delete({ where: { id: verification.id } });
      return badRequest("Verification code has expired. Please request a new one.");
    }

    if (verification.code !== trimmedCode) {
      return badRequest("Incorrect verification code. Please try again.");
    }

    // Code is valid — clean up and create user
    await prisma.emailVerification.delete({ where: { id: verification.id } });

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return conflictResponse("An account with this email already exists.");
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: trimmedName, email: normalizedEmail, password: hashed },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("[signup]", err);
    return serverError();
  }
}
