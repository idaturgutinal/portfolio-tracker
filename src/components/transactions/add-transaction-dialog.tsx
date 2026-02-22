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
import { formatCurrency } from "@/utils/format";
import type { AssetOption } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetOptions: AssetOption[];
  onSuccess: () => void;
}

interface FormState {
  assetId: string;
  type: string;
  quantity: string;
  pricePerUnit: string;
  fees: string;
  date: string;
  notes: string;
}

function defaultForm(): FormState {
  return {
    assetId: "",
    type: "BUY",
    quantity: "",
    pricePerUnit: "",
    fees: "0",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  };
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  assetOptions,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form whenever dialog opens
  useEffect(() => {
    if (!open) return;
    setForm(defaultForm());
    setError(null);
  }, [open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Live total preview
  const qty = parseFloat(form.quantity);
  const price = parseFloat(form.pricePerUnit);
  const fees = parseFloat(form.fees || "0");
  const previewTotal =
    !isNaN(qty) && !isNaN(price) && qty > 0 && price > 0
      ? form.type === "BUY"
        ? qty * price + (!isNaN(fees) ? fees : 0)
        : qty * price - (!isNaN(fees) ? fees : 0)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.assetId) return setError("Please select an asset.");
    if (isNaN(qty) || qty <= 0) return setError("Quantity must be a positive number.");
    if (isNaN(price) || price <= 0) return setError("Price per unit must be positive.");
    if (!isNaN(fees) && fees < 0) return setError("Fees cannot be negative.");
    if (!form.date) return setError("Date is required.");

    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId: form.assetId,
        type: form.type,
        quantity: qty,
        pricePerUnit: price,
        fees: isNaN(fees) ? 0 : fees,
        date: new Date(form.date + "T12:00:00").toISOString(),
        notes: form.notes.trim() || undefined,
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
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Asset */}
          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={form.assetId} onValueChange={(v) => set("assetId", v)}>
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

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
                <SelectItem value="DIVIDEND">Dividend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price / Unit</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="any"
                value={form.pricePerUnit}
                onChange={(e) => set("pricePerUnit", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Fees + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fees">Fees</Label>
              <Input
                id="fees"
                type="number"
                min="0"
                step="any"
                value={form.fees}
                onChange={(e) => set("fees", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txdate">Date</Label>
              <Input
                id="txdate"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notes{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="e.g. Quarterly dividend reinvestment"
              disabled={loading}
            />
          </div>

          {/* Live total preview */}
          {previewTotal !== null && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm flex justify-between">
              <span className="text-muted-foreground">
                {form.type === "BUY" ? "Total cost" : "Net proceeds"}
              </span>
              <span className="font-semibold">{formatCurrency(previewTotal)}</span>
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
              {loading ? "Adding…" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
