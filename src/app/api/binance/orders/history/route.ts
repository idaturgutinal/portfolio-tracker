import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const limit = searchParams.get("limit");

    if (!symbol) {
      return badRequest("Symbol is required for order history");
    }

    const client = createBinanceClient();
    const orders = await client.getAllOrders(
      symbol,
      limit ? parseInt(limit, 10) : undefined
    );

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get order history";
    return serverError(message);
  }
}
