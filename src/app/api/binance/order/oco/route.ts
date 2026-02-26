import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api-utils";
import { BinanceClient } from "@/lib/binance/client";
import { getUserApiKeys } from "@/lib/binance/helpers";
import { checkUserRateLimit, checkOrderRateLimit } from "@/lib/binance/rate-limiter";
import { sanitizeInput } from "@/lib/binance/validators";
import type { OrderSide, TimeInForce } from "@/lib/binance/types";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLimit = checkUserRateLimit(userId);
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(userLimit.retryAfterMs / 1000)) } },
      );
    }

    const orderLimit = checkOrderRateLimit(userId);
    if (!orderLimit.allowed) {
      return NextResponse.json(
        { error: "Order rate limit exceeded. Maximum 10 orders per minute." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(orderLimit.retryAfterMs / 1000)) } },
      );
    }

    const body = (await request.json()) as Record<string, string | undefined>;

    const errors: string[] = [];
    if (!body.symbol) errors.push("symbol is required");
    if (!body.side || !["BUY", "SELL"].includes(body.side)) errors.push("side must be BUY or SELL");
    if (!body.quantity || Number(body.quantity) <= 0) errors.push("quantity must be a positive number");
    if (!body.price || Number(body.price) <= 0) errors.push("price must be a positive number");
    if (!body.stopPrice || Number(body.stopPrice) <= 0) errors.push("stopPrice must be a positive number");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const keys = await getUserApiKeys(userId);
    if (!keys) {
      return NextResponse.json(
        { error: "No Binance API keys configured. Please add your API keys in settings." },
        { status: 400 },
      );
    }

    const client = new BinanceClient({ apiKey: keys.apiKey, secretKey: keys.secretKey });
    const data = await client.newOcoOrder({
      symbol: sanitizeInput(body.symbol!).toUpperCase(),
      side: body.side as OrderSide,
      quantity: body.quantity!,
      price: body.price!,
      stopPrice: body.stopPrice!,
      stopLimitPrice: body.stopLimitPrice,
      stopLimitTimeInForce: body.stopLimitTimeInForce as TimeInForce | undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/order/oco error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
