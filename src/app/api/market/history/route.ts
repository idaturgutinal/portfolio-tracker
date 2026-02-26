import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, serverError } from "@/lib/api-utils";
import { getHistoricalData, type HistoryRange } from "@/services/marketData";

const VALID_RANGES: HistoryRange[] = ["1mo", "3mo", "6mo", "1y", "2y", "5y"];

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

    const rawRange = req.nextUrl.searchParams.get("range") ?? "1y";
    const range: HistoryRange = VALID_RANGES.includes(rawRange as HistoryRange)
      ? (rawRange as HistoryRange)
      : "1y";

    const result = await getHistoricalData(symbol, range);

    if (!result.data) {
      return NextResponse.json(
        { error: result.error ?? "Failed to fetch history" },
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
