import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserProfile } from "@/services/user.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "HKD", "SGD",
  "NOK", "SEK", "DKK", "NZD", "INR", "BRL", "MXN", "ZAR", "KRW", "TRY",
]);

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, defaultCurrency } = body as {
      name?: unknown;
      email?: unknown;
      defaultCurrency?: unknown;
    };

    const updates: { name?: string; email?: string; defaultCurrency?: string } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or fewer." },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return NextResponse.json({ error: "Invalid email." }, { status: 400 });
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (!EMAIL_RE.test(normalizedEmail)) {
        return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
      }
      if (normalizedEmail.length > 254) {
        return NextResponse.json({ error: "Email is too long." }, { status: 400 });
      }

      const conflict = await prisma.user.findFirst({
        where: { email: normalizedEmail, NOT: { id: session.user.id } },
      });
      if (conflict) {
        return NextResponse.json({ error: "Email already in use." }, { status: 409 });
      }
      updates.email = normalizedEmail;
    }

    if (defaultCurrency !== undefined) {
      if (typeof defaultCurrency !== "string" || !VALID_CURRENCIES.has(defaultCurrency.toUpperCase())) {
        return NextResponse.json({ error: "Unsupported currency." }, { status: 400 });
      }
      updates.defaultCurrency = defaultCurrency.toUpperCase();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const updated = await updateUserProfile(session.user.id, updates);

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      defaultCurrency: updated.defaultCurrency,
    });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
