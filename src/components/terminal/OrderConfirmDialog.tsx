"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { OrderSide, OrderType } from "@/lib/binance/order-client";

interface OrderDetails {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price?: string;
  stopPrice?: string;
}

interface OrderConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetails | null;
  onConfirm: (order: OrderDetails) => Promise<boolean>;
}

function formatOrderType(type: OrderType): string {
  switch (type) {
    case "MARKET":
      return "Market";
    case "LIMIT":
      return "Limit";
    case "STOP_LOSS_LIMIT":
      return "Stop-Limit";
    default:
      return type;
  }
}

function estimateTotal(order: OrderDetails): string {
  const qty = parseFloat(order.quantity);
  const price = order.price ? parseFloat(order.price) : 0;
  if (order.type === "MARKET") return "Market price";
  return (qty * price).toFixed(8);
}

function estimateCommission(order: OrderDetails): string {
  const qty = parseFloat(order.quantity);
  const price = order.price ? parseFloat(order.price) : 0;
  if (order.type === "MARKET") return "~0.1%";
  return (qty * price * 0.001).toFixed(8);
}

export function OrderConfirmDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
}: OrderConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const isBuy = order.side === "BUY";

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const success = await onConfirm(order);
      if (success) {
        toast({
          title: "Order Placed",
          description: `${order.side} ${order.quantity} ${order.symbol} - ${formatOrderType(order.type)}`,
          variant: "success",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Order Failed",
          description: "Could not place order. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Confirm {formatOrderType(order.type)} Order
          </DialogTitle>
          <DialogDescription>
            Review your order details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pair</span>
            <span className="font-medium">{order.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Side</span>
            <span
              className={`font-medium ${isBuy ? "text-green-500" : "text-red-500"}`}
            >
              {order.side}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{formatOrderType(order.type)}</span>
          </div>
          {order.price && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">{order.price}</span>
            </div>
          )}
          {order.stopPrice && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stop Price</span>
              <span className="font-medium">{order.stopPrice}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-medium">{order.quantity}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Total</span>
              <span className="font-medium">{estimateTotal(order)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Est. Commission</span>
              <span className="font-medium">{estimateCommission(order)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={
              isBuy
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Placing...
              </span>
            ) : (
              `Confirm ${order.side}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
