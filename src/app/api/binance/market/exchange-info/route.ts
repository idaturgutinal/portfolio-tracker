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
    const symbol = searchParams.get("symbol") ?? undefined;

    const client = createPublicClient();
    const data = await client.getExchangeInfo(symbol?.toUpperCase());

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/market/exchange-info error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
