import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/binance/client";
import { checkPublicRateLimit } from "@/lib/binance/rate-limiter";
import { getClientIp } from "@/lib/rate-limit";

const VALID_LIMITS = [5, 10, 20, 50, 100, 500, 1000, 5000];

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

    const depthLimit = limitParam ? parseInt(limitParam, 10) : 100;
    if (!VALID_LIMITS.includes(depthLimit)) {
      return NextResponse.json(
        { error: `limit must be one of: ${VALID_LIMITS.join(", ")}` },
        { status: 400 },
      );
    }

    const client = createPublicClient();
    const data = await client.getOrderBook(symbol.toUpperCase(), depthLimit);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/market/depth error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
