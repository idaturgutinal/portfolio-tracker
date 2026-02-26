import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/binance/client";
import { checkPublicRateLimit } from "@/lib/binance/rate-limiter";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkPublicRateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const limitParam = searchParams.get("limit");

    if (!symbol) {
      return NextResponse.json({ error: "symbol parameter is required" }, { status: 400 });
    }

    const tradesLimit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 500), 1000) : 500;

    const client = createPublicClient();
    const data = await client.getRecentTrades(symbol.toUpperCase(), tradesLimit);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/market/trades error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
