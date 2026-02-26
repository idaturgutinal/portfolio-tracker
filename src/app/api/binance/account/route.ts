import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api-utils";
import { BinanceClient } from "@/lib/binance/client";
import { getUserApiKeys } from "@/lib/binance/helpers";
import { checkUserRateLimit } from "@/lib/binance/rate-limiter";

export async function GET() {
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
    const data = await client.getAccountInfo();

    // Filter out zero balances
    const nonZeroBalances = data.balances.filter((b) => {
      const free = parseFloat(b.free);
      const locked = parseFloat(b.locked);
      return free > 0 || locked > 0;
    });

    return NextResponse.json({
      balances: nonZeroBalances.map((b) => ({
        asset: b.asset,
        free: b.free,
        locked: b.locked,
      })),
    });
  } catch (error) {
    console.error("[API] binance/account error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
