import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ── Auth helper ──────────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's ID, or null if not authenticated.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// ── Standard error responses ─────────────────────────────────────────────────

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export function notFound(error: string) {
  return NextResponse.json({ error }, { status: 404 });
}

export function conflictResponse(error: string) {
  return NextResponse.json({ error }, { status: 409 });
}

export function tooManyRequests(error = "Too many requests. Please try again later.") {
  return NextResponse.json({ error }, { status: 429 });
}

export function serverError(error = "An unexpected error occurred.") {
  return NextResponse.json({ error }, { status: 500 });
}
