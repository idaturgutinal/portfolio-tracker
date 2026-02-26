import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

interface CancelAllBody {
  symbol: string;
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const body = (await req.json()) as CancelAllBody;
    const { symbol } = body;

    if (!symbol || typeof symbol !== "string") {
      return badRequest("Symbol is required");
    }

    const client = createBinanceClient();
    const result = await client.cancelAllOrders(symbol);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel orders";
    return serverError(message);
  }
}
