"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetOption } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetOptions: AssetOption[];
  onSuccess: () => void;
}

interface FormState {
  assetId: string;
  symbol: string;
  condition: "ABOVE" | "BELOW";
  targetPrice: string;
}

function defaultForm(): FormState {
  return { assetId: "", symbol: "", condition: "ABOVE", targetPrice: "" };
}

export function AddAlertDialog({
  open,
  onOpenChange,
  assetOptions,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm());
    setError(null);
  }, [open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAssetChange(assetId: string) {
    const asset = assetOptions.find((a) => a.id === assetId);
    setForm((prev) => ({
      ...prev,
      assetId,
      symbol: asset?.symbol ?? "",
    }));
  }

  const price = parseFloat(form.targetPrice);
  const previewValid = form.symbol && !isNaN(price) && price > 0;
  const directionLabel = form.condition === "ABOVE" ? "goes above" : "falls below";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.assetId) return setError("Please select an asset.");
    if (isNaN(price) || price <= 0)
      return setError("Target price must be a positive number.");

    setLoading(true);
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId: form.assetId,
        symbol: form.symbol,
        condition: form.condition,
        targetPrice: price,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "Something went wrong.");
      return;
    }

    onSuccess();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={form.assetId} onValueChange={handleAssetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset…" />
              </SelectTrigger>
              <SelectContent>
                {assetOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="font-medium">{a.symbol}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {a.portfolioName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select
              value={form.condition}
              onValueChange={(v) => set("condition", v as "ABOVE" | "BELOW")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABOVE">Goes above</SelectItem>
                <SelectItem value="BELOW">Falls below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetPrice">Target Price</Label>
            <Input
              id="targetPrice"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={form.targetPrice}
              onChange={(e) => set("targetPrice", e.target.value)}
              disabled={loading}
            />
          </div>

          {previewValid && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Notify me when{" "}
              <span className="font-semibold text-foreground">{form.symbol}</span>{" "}
              {directionLabel}{" "}
              <span className="font-semibold text-foreground">
                ${price.toFixed(2)}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
