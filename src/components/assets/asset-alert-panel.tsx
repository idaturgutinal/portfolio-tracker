"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, RefreshCw, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import type { PriceAlertRow } from "@/types";

interface Props {
  assetId: string;
  symbol: string;
  initialAlerts: PriceAlertRow[];
}

export function AssetAlertPanel({ assetId, symbol, initialAlerts }: Props) {
  const [alerts, setAlerts] = useState<PriceAlertRow[]>(initialAlerts);
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, symbol, condition, targetPrice: price }),
      });
      if (res.ok) {
        const alert = await res.json();
        setAlerts((prev) => [
          {
            id: alert.id,
            assetId: alert.assetId,
            symbol: alert.symbol,
            assetName: "",
            condition: alert.condition,
            targetPrice: alert.targetPrice,
            active: alert.active,
            triggeredAt: alert.triggeredAt ?? null,
            createdAt: alert.createdAt,
          },
          ...prev,
        ]);
        setTargetPrice("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleReactivate(id: string) {
    const res = await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    if (res.ok) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, active: true, triggeredAt: null } : a
        )
      );
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Price Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        <div className="flex gap-2">
          <Select
            value={condition}
            onValueChange={(v) => setCondition(v as "ABOVE" | "BELOW")}
          >
            <SelectTrigger className="w-24 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ABOVE">Above</SelectItem>
              <SelectItem value="BELOW">Below</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Target price"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleCreate} disabled={loading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Alerts list */}
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No alerts for this asset.
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {alert.condition === "ABOVE" ? "Above" : "Below"}
                  </span>
                  <span className="font-mono">
                    {formatCurrency(alert.targetPrice)}
                  </span>
                  {alert.active ? (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Triggered
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {!alert.active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReactivate(alert.id)}
                      title="Reactivate"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(alert.id)}
                    title="Delete alert"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
