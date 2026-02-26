import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";
import type { OrderSide, OrderType } from "@/lib/binance/order-client";
import {
  validateMarketOrder,
  validateLimitOrder,
  validateStopLimitOrder,
  validateOrderType,
} from "@/lib/binance/order-validators";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

interface PlaceOrderBody {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price?: string;
  stopPrice?: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const body = (await req.json()) as PlaceOrderBody;
    const { symbol, side, type, quantity, price, stopPrice } = body;

    const typeCheck = validateOrderType(type);
    if (!typeCheck.valid) return badRequest(typeCheck.error!);

    if (type === "MARKET") {
      const result = validateMarketOrder({ symbol, side, quantity });
      if (!result.valid) return badRequest(result.error!);
    } else if (type === "LIMIT") {
      if (!price) return badRequest("Price is required for LIMIT orders");
      const result = validateLimitOrder({ symbol, side, quantity, price });
      if (!result.valid) return badRequest(result.error!);
    } else if (type === "STOP_LOSS_LIMIT") {
      if (!price) return badRequest("Price is required for STOP_LOSS_LIMIT orders");
      if (!stopPrice) return badRequest("Stop price is required for STOP_LOSS_LIMIT orders");
      const result = validateStopLimitOrder({ symbol, side, quantity, price, stopPrice });
      if (!result.valid) return badRequest(result.error!);
    }

    const client = createBinanceClient();
    const order = await client.placeOrder({
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
    });

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    return serverError(message);
  }
}
