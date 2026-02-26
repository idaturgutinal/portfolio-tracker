import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api-utils";
import { BinanceClient } from "@/lib/binance/client";
import { getUserApiKeys } from "@/lib/binance/helpers";
import { checkUserRateLimit } from "@/lib/binance/rate-limiter";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

export async function POST() {
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

    const keys = await getUserApiKeys(userId);
    if (!keys) {
      return NextResponse.json(
        { error: "No Binance API keys configured. Please add your API keys in settings." },
        { status: 400 },
      );
    }

    const client = new BinanceClient({ apiKey: keys.apiKey, secretKey: keys.secretKey });
    const data = await client.createListenKey();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/user-data-stream error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
