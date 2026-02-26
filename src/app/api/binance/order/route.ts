import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/api-utils";
import { BinanceClient } from "@/lib/binance/client";
import { getUserApiKeys } from "@/lib/binance/helpers";
import { checkUserRateLimit, checkOrderRateLimit } from "@/lib/binance/rate-limiter";
import { validateOrderParams, sanitizeInput } from "@/lib/binance/validators";
import type { OrderSide, OrderType, TimeInForce } from "@/lib/binance/types";

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

    const validation = validateOrderParams({
      symbol: body.symbol,
      side: body.side,
      type: body.type,
      quantity: body.quantity,
      price: body.price,
      stopPrice: body.stopPrice,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
    }

    const keys = await getUserApiKeys(userId);
    if (!keys) {
      return NextResponse.json(
        { error: "No Binance API keys configured. Please add your API keys in settings." },
        { status: 400 },
      );
    }

    const client = new BinanceClient({ apiKey: keys.apiKey, secretKey: keys.secretKey });
    const data = await client.newOrder({
      symbol: sanitizeInput(body.symbol!).toUpperCase(),
      side: body.side as OrderSide,
      type: body.type as OrderType,
      quantity: body.quantity!,
      price: body.price,
      stopPrice: body.stopPrice,
      timeInForce: body.timeInForce as TimeInForce | undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/order POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const orderId = searchParams.get("orderId");

    if (!symbol) {
      return NextResponse.json({ error: "symbol parameter is required" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "orderId parameter is required" }, { status: 400 });
    }

    const keys = await getUserApiKeys(userId);
    if (!keys) {
      return NextResponse.json(
        { error: "No Binance API keys configured. Please add your API keys in settings." },
        { status: 400 },
      );
    }

    const client = new BinanceClient({ apiKey: keys.apiKey, secretKey: keys.secretKey });
    const data = await client.cancelOrder({
      symbol: symbol.toUpperCase(),
      orderId: parseInt(orderId, 10),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] binance/order DELETE error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
