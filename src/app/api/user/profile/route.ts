import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, conflictResponse, serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { updateUserProfile } from "@/services/user.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "HKD", "SGD",
  "NOK", "SEK", "DKK", "NZD", "INR", "BRL", "MXN", "ZAR", "KRW", "TRY",
]);

export async function PATCH(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

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
        return badRequest("Name cannot be empty.");
      }
      if (name.trim().length > 100) {
        return badRequest("Name must be 100 characters or fewer.");
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return badRequest("Invalid email.");
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (!EMAIL_RE.test(normalizedEmail)) {
        return badRequest("A valid email address is required.");
      }
      if (normalizedEmail.length > 254) {
        return badRequest("Email is too long.");
      }

      const conflict = await prisma.user.findFirst({
        where: { email: normalizedEmail, NOT: { id: userId } },
      });
      if (conflict) {
        return conflictResponse("Email already in use.");
      }
      updates.email = normalizedEmail;
    }

    if (defaultCurrency !== undefined) {
      if (typeof defaultCurrency !== "string" || !VALID_CURRENCIES.has(defaultCurrency.toUpperCase())) {
        return badRequest("Unsupported currency.");
      }
      updates.defaultCurrency = defaultCurrency.toUpperCase();
    }

    if (Object.keys(updates).length === 0) {
      return badRequest("No fields to update.");
    }

    const updated = await updateUserProfile(userId, updates);

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      defaultCurrency: updated.defaultCurrency,
    });
  } catch {
    return serverError();
  }
}
