import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api-utils";
import { BinanceClient } from "@/lib/binance/client";
import { getUserApiKeys } from "@/lib/binance/helpers";
import { checkUserRateLimit } from "@/lib/binance/rate-limiter";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = checkUserRateLimit(userId);
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

    const keys = await getUserApiKeys(userId);
    if (!keys) {
      return NextResponse.json(
        { error: "No Binance API keys configured. Please add your API keys in settings." },
        { status: 400 },
      );
    }

    const orderLimit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 500), 1000) : 500;

    const client = new BinanceClient({ apiKey: keys.apiKey, secretKey: keys.secretKey });
    const data = await client.getAllOrders(symbol.toUpperCase(), orderLimit);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/orders/history error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
