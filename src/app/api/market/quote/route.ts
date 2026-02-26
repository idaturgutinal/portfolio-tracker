import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, serverError } from "@/lib/api-utils";
import { getQuote } from "@/services/marketData";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
    if (!symbol) {
      return badRequest("symbol query param required");
    }
    if (symbol.length > 20) {
      return badRequest("Symbol too long.");
    }

    const result = await getQuote(symbol);

    if (!result.data) {
      return NextResponse.json(
        { error: result.error ?? "Failed to fetch quote" },
        { status: 502 }
      );
    }

    return NextResponse.json(result, {
      headers: result.stale ? { "X-Cache": "STALE" } : { "X-Cache": "MISS" },
    });
  } catch {
    return serverError();
  }
}
