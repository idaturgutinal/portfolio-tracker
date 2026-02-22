"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import type { TriggeredAlert } from "@/types";

interface AlertNotifierProps {
  triggered: TriggeredAlert[];
}

export function AlertNotifier({ triggered }: AlertNotifierProps) {
  useEffect(() => {
    triggered.forEach((a) => {
      const direction = a.condition === "ABOVE" ? "above" : "below";
      toast({
        title: `Price alert triggered: ${a.symbol}`,
        description: `${a.symbol} is now $${a.currentPrice.toFixed(2)} — ${direction} your target of $${a.targetPrice.toFixed(2)}`,
        variant: "success",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
