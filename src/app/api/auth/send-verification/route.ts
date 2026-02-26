import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { badRequest, conflictResponse, tooManyRequests } from "@/lib/api-utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`send-verification:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return tooManyRequests(undefined, rl.resetAt - Date.now());
  }

  try {
    const body = await req.json();
    const { email, name, password } = body as {
      email?: unknown;
      name?: unknown;
      password?: unknown;
    };

    if (
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string"
    ) {
      return badRequest("Invalid request body.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) return badRequest("Name is required.");
    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail))
      return badRequest("A valid email address is required.");
    if (password.length < 8)
      return badRequest("Password must be at least 8 characters.");

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return conflictResponse("An account with this email already exists.");
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    // Delete any prior pending verification for this email
    await prisma.emailVerification.deleteMany({ where: { email: normalizedEmail } });

    await prisma.emailVerification.create({
      data: { email: normalizedEmail, code, expiresAt },
    });

    await sendVerificationEmail(normalizedEmail, code);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[send-verification]", err);
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }
}
