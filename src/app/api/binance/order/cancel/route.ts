import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

interface CancelOrderBody {
  symbol: string;
  orderId: number;
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const body = (await req.json()) as CancelOrderBody;
    const { symbol, orderId } = body;

    if (!symbol || typeof symbol !== "string") {
      return badRequest("Symbol is required");
    }
    if (!orderId || typeof orderId !== "number") {
      return badRequest("Valid orderId is required");
    }

    const client = await createBinanceClient(userId, true);
    const result = await client.cancelOrder(symbol, orderId);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    return serverError(message);
  }
}
