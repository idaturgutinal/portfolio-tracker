import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") ?? undefined;

    const client = createBinanceClient();
    const orders = await client.getOpenOrders(symbol);

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get open orders";
    return serverError(message);
  }
}
