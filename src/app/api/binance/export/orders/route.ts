import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, badRequest, unauthorizedResponse, serverError } from "@/lib/api-utils";
import { createBinanceClient } from "@/lib/binance/order-client";
import type { BinanceOpenOrder } from "@/lib/binance/order-client";

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

function orderToCsvRow(order: BinanceOpenOrder): string {
  const total = (parseFloat(order.price) * parseFloat(order.origQty)).toFixed(8);
  return [
    formatDate(order.time),
    order.symbol,
    order.type,
    order.side,
    order.price,
    order.origQty,
    order.status,
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
      return badRequest("Symbol is required for order export");
    }

    const client = createBinanceClient();
    const orders = await client.getAllOrders(symbol);

    const header = "Date,Pair,Type,Side,Price,Quantity,Status,Total";
    const rows = orders.map(orderToCsvRow);
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders_${symbol}_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export orders";
    return serverError(message);
  }
}
