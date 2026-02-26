"use client";

import { Button } from "@/components/ui/button";
import type { BinanceOpenOrder } from "@/lib/binance/order-client";

interface OpenOrdersTableProps {
  orders: BinanceOpenOrder[];
  isLoading: boolean;
  onCancelOrder: (symbol: string, orderId: number) => void;
  onCancelAll: (symbol: string) => void;
  cancelLoading: boolean;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function filledPercent(order: BinanceOpenOrder): string {
  const executed = parseFloat(order.executedQty);
  const orig = parseFloat(order.origQty);
  if (orig === 0) return "0%";
  return `${((executed / orig) * 100).toFixed(1)}%`;
}

function calcTotal(order: BinanceOpenOrder): string {
  const price = parseFloat(order.price);
  const qty = parseFloat(order.origQty);
  return (price * qty).toFixed(8);
}

export function OpenOrdersTable({
  orders,
  isLoading,
  onCancelOrder,
  onCancelAll,
  cancelLoading,
}: OpenOrdersTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        Loading open orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No open orders
      </div>
    );
  }

  const symbols = [...new Set(orders.map((o) => o.symbol))];

  return (
    <div className="space-y-4">
      {symbols.length === 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancelAll(symbols[0])}
            disabled={cancelLoading}
            className="text-red-500 border-red-500 hover:bg-red-500/10"
          >
            {cancelLoading ? "Canceling..." : "Cancel All"}
          </Button>
        </div>
      )}

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
              <th className="text-right py-2 px-2 font-medium">Filled</th>
              <th className="text-right py-2 px-2 font-medium">Total</th>
              <th className="text-right py-2 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId} className="border-b hover:bg-muted/50">
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
                <td className="py-2 px-2 text-right">
                  {filledPercent(order)}
                </td>
                <td className="py-2 px-2 text-right">{calcTotal(order)}</td>
                <td className="py-2 px-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelOrder(order.symbol, order.orderId)}
                    disabled={cancelLoading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 px-2"
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
