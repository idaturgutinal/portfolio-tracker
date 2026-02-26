import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";
import type { OrderSide } from "@/lib/binance/order-client";
import { validateOcoOrder } from "@/lib/binance/order-validators";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

interface OcoOrderBody {
  symbol: string;
  side: OrderSide;
  quantity: string;
  price: string;
  stopPrice: string;
  stopLimitPrice: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const body = (await req.json()) as OcoOrderBody;
    const { symbol, side, quantity, price, stopPrice, stopLimitPrice } = body;

    const validation = validateOcoOrder({ symbol, side, quantity, price, stopPrice, stopLimitPrice });
    if (!validation.valid) return badRequest(validation.error!);

    const client = createBinanceClient();
    const order = await client.placeOcoOrder({
      symbol,
      side,
      quantity,
      price,
      stopPrice,
      stopLimitPrice,
    });

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place OCO order";
    return serverError(message);
  }
}
