import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const limit = searchParams.get("limit");

    if (!symbol) {
      return badRequest("Symbol is required for trade history");
    }

    const client = await createBinanceClient(userId);
    const trades = await client.getMyTrades(
      symbol,
      limit ? parseInt(limit, 10) : undefined
    );

    return NextResponse.json(trades);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get trade history";
    return serverError(message);
  }
}
