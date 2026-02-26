"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BinanceOpenOrder } from "@/lib/binance/order-client";

type DateRange = "1d" | "7d" | "30d" | "all";

interface OrderHistoryTableProps {
  orders: BinanceOpenOrder[];
  isLoading: boolean;
  symbol?: string;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function calcTotal(order: BinanceOpenOrder): string {
  const cummulative = parseFloat(order.cummulativeQuoteQty);
  if (cummulative > 0) return cummulative.toFixed(8);
  const price = parseFloat(order.price);
  const qty = parseFloat(order.origQty);
  return (price * qty).toFixed(8);
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "FILLED":
      return "Filled";
    case "CANCELED":
      return "Canceled";
    case "PARTIALLY_FILLED":
      return "Partial";
    case "NEW":
      return "New";
    case "EXPIRED":
      return "Expired";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "FILLED":
      return "text-green-500";
    case "CANCELED":
    case "EXPIRED":
    case "REJECTED":
      return "text-red-500";
    case "PARTIALLY_FILLED":
      return "text-yellow-500";
    default:
      return "text-muted-foreground";
  }
}

function filterByDateRange(orders: BinanceOpenOrder[], range: DateRange): BinanceOpenOrder[] {
  if (range === "all") return orders;

  const now = Date.now();
  const msMap: Record<Exclude<DateRange, "all">, number> = {
    "1d": 86400000,
    "7d": 604800000,
    "30d": 2592000000,
  };

  const cutoff = now - msMap[range];
  return orders.filter((o) => o.time >= cutoff);
}

function handleExport(symbol: string | undefined) {
  if (!symbol) return;
  window.open(`/api/binance/export/orders?symbol=${symbol}`, "_blank");
}

export function OrderHistoryTable({
  orders,
  isLoading,
  symbol,
}: OrderHistoryTableProps) {
  const [dateRange, setDateRange] = useState<DateRange>("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        Loading order history...
      </div>
    );
  }

  const filteredOrders = filterByDateRange(orders || [], dateRange);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["1d", "7d", "30d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
              className="h-7 px-2 text-xs"
            >
              {range === "all" ? "All" : range.toUpperCase()}
            </Button>
          ))}
        </div>
        {symbol && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(symbol)}
            className="h-7 px-3 text-xs"
          >
            Export CSV
          </Button>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No orders found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-2 font-medium">Date</th>
                <th className="text-left py-2 px-2 font-medium">Pair</th>
                <th className="text-left py-2 px-2 font-medium">Type</th>
                <th className="text-left py-2 px-2 font-medium">Side</th>
                <th className="text-right py-2 px-2 font-medium">Price</th>
                <th className="text-right py-2 px-2 font-medium">Quantity</th>
                <th className="text-left py-2 px-2 font-medium">Status</th>
                <th className="text-right py-2 px-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.orderId}
                  className="border-b hover:bg-muted/50"
                >
                  <td className="py-2 px-2 whitespace-nowrap">
                    {formatDate(order.time)}
                  </td>
                  <td className="py-2 px-2 font-medium">{order.symbol}</td>
                  <td className="py-2 px-2">{order.type}</td>
                  <td
                    className={`py-2 px-2 font-medium ${
                      order.side === "BUY" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {order.side}
                  </td>
                  <td className="py-2 px-2 text-right">{order.price}</td>
                  <td className="py-2 px-2 text-right">{order.origQty}</td>
                  <td
                    className={`py-2 px-2 ${getStatusColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {calcTotal(order)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
