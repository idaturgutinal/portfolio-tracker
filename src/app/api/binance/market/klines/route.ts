import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/binance/client";
import { checkPublicRateLimit } from "@/lib/binance/rate-limiter";
import { getClientIp } from "@/lib/rate-limit";
import type { KlineInterval } from "@/lib/binance/types";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

const VALID_INTERVALS: KlineInterval[] = [
  "1m", "3m", "5m", "15m", "30m",
  "1h", "2h", "4h", "6h", "8h", "12h",
  "1d", "3d", "1w", "1M",
];

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
    const interval = searchParams.get("interval") as KlineInterval | null;
    const limitParam = searchParams.get("limit");

    if (!symbol) {
      return NextResponse.json({ error: "symbol parameter is required" }, { status: 400 });
    }

    if (!interval || !VALID_INTERVALS.includes(interval)) {
      return NextResponse.json(
        { error: `interval must be one of: ${VALID_INTERVALS.join(", ")}` },
        { status: 400 },
      );
    }

    const klineLimit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 500), 1000) : 500;

    const client = createPublicClient();
    const data = await client.getKlines(symbol.toUpperCase(), interval, klineLimit);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/market/klines error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
