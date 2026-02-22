import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
    const { name, email, password } = body as { name?: unknown; email?: unknown; password?: unknown };

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (trimmedName.length > 100) return NextResponse.json({ error: "Name must be 100 characters or fewer." }, { status: 400 });
    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    if (normalizedEmail.length > 254) return NextResponse.json({ error: "Email address is too long." }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (password.length > 128) return NextResponse.json({ error: "Password is too long." }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: trimmedName, email: normalizedEmail, password: hashed },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "An unexpected error occurred.", details: err?.message || String(err) }, { status: 500 });
  }
}
