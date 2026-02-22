import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuote } from "@/services/marketData";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
    if (!symbol) {
      return NextResponse.json({ error: "symbol query param required" }, { status: 400 });
    }
    if (symbol.length > 20) {
      return NextResponse.json({ error: "Symbol too long." }, { status: 400 });
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
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
