import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";
import type { BinanceTrade } from "@/lib/binance/order-client";

export const preferredRegion = ['fra1', 'lhr1', 'cdg1'];

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().replace("T", " ").slice(0, 19);
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function tradeToCsvRow(trade: BinanceTrade): string {
  const total = (parseFloat(trade.price) * parseFloat(trade.qty)).toFixed(8);
  return [
    formatDate(trade.time),
    trade.symbol,
    trade.isBuyer ? "BUY" : "SELL",
    trade.price,
    trade.qty,
    trade.commission,
    trade.commissionAsset,
    total,
  ]
    .map(escapeCsvField)
    .join(",");
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return badRequest("Symbol is required for trade export");
    }

    const client = await createBinanceClient(userId);
    const trades = await client.getMyTrades(symbol);

    const header = "Date,Pair,Side,Price,Quantity,Commission,Commission Asset,Total";
    const rows = trades.map(tradeToCsvRow);
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="trades_${symbol}_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export trades";
    return serverError(message);
  }
}
