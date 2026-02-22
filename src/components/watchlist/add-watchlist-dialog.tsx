"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import type { SymbolSearchResult } from "@/services/marketData";

const ASSET_TYPES = [
  { value: "STOCK", label: "Stock" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "ETF", label: "ETF" },
  { value: "MUTUAL_FUND", label: "Mutual Fund" },
  { value: "BOND", label: "Bond" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormState {
  symbol: string;
  name: string;
  assetType: string;
  notes: string;
}

function defaultForm(): FormState {
  return { symbol: "", name: "", assetType: "STOCK", notes: "" };
}

export function AddWatchlistDialog({ open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm());
    setError(null);
    setResults([]);
    setDropdownOpen(false);
  }, [open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      set("symbol", value);
      clearTimeout(timerRef.current);
      if (!value.trim()) {
        setResults([]);
        setDropdownOpen(false);
        return;
      }
      timerRef.current = setTimeout(async () => {
        const res = await fetch(
          `/api/market/search?q=${encodeURIComponent(value)}`
        );
        if (res.ok) {
          const data = (await res.json()) as SymbolSearchResult[];
          setResults(data);
          setDropdownOpen(data.length > 0);
        }
      }, 350);
    },
    []
  );

  function handleSelectResult(r: SymbolSearchResult) {
    setForm((prev) => ({
      ...prev,
      symbol: r.symbol,
      name: r.name || prev.name,
      assetType: r.suggestedType || prev.assetType,
    }));
    setResults([]);
    setDropdownOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.symbol.trim()) return setError("Symbol is required.");
    if (!form.name.trim()) return setError("Name is required.");

    setLoading(true);
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: form.symbol.trim().toUpperCase(),
        name: form.name.trim(),
        assetType: form.assetType,
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
          <DialogTitle>Add to Watchlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="wl-symbol">Symbol</Label>
            <div className="relative">
              <Input
                id="wl-symbol"
                value={form.symbol}
                onChange={handleSymbolChange}
                placeholder="AAPL, BTC, SPY…"
                autoComplete="off"
                disabled={loading}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              />
              {dropdownOpen && results.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {results.map((r) => (
                    <li key={r.symbol}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-baseline gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectResult(r);
                        }}
                      >
                        <span className="font-medium shrink-0">{r.symbol}</span>
                        <span className="text-muted-foreground text-xs truncate">
                          {r.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wl-name">Name</Label>
            <Input
              id="wl-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Apple Inc."
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Asset Type</Label>
            <Select
              value={form.assetType}
              onValueChange={(v) => set("assetType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wl-notes">
              Notes{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="wl-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Why you're watching this…"
              disabled={loading}
            />
          </div>

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
              {loading ? "Adding…" : "Add to watchlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}