import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getUserById, deleteUserAccount } from "@/services/user.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 deletion attempts per user per hour
  const rl = rateLimit(`delete-account:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Also rate limit by IP
  const ip = getClientIp(req);
  const ipRl = rateLimit(`delete-account-ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((ipRl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { password, confirmation } = body as { password?: unknown; confirmation?: unknown };

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.password) {
      // Email/password user — verify password
      if (typeof password !== "string" || !password) {
        return NextResponse.json({ error: "Password is required." }, { status: 400 });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 400 });
      }
    } else {
      // OAuth user (no password) — require typing "DELETE"
      if (confirmation !== "DELETE") {
        return NextResponse.json({ error: "Type DELETE to confirm." }, { status: 400 });
      }
    }

    await deleteUserAccount(session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
