"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { EnrichedAsset, PortfolioOption } from "@/types";
import type { SymbolSearchResult } from "@/services/marketData";
import { ASSET_TYPES, ASSET_TYPE_LABELS } from "@/lib/constants";

type AddMode = { mode: "add"; portfolios: PortfolioOption[] };
type EditMode = { mode: "edit"; asset: EnrichedAsset };

type Props = (AddMode | EditMode) & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

interface FormState {
  portfolioId: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: string;
  averageBuyPrice: string;
  currency: string;
  notes: string;
}

function defaultForm(asset?: EnrichedAsset): FormState {
  return {
    portfolioId: asset?.portfolioId ?? "",
    symbol: asset?.symbol ?? "",
    name: asset?.name ?? "",
    assetType: asset?.assetType ?? "STOCK",
    quantity: asset ? String(asset.quantity) : "",
    averageBuyPrice: asset ? String(asset.averageBuyPrice) : "",
    currency: asset?.currency ?? "USD",
    notes: asset?.notes ?? "",
  };
}

export function AssetFormDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const [form, setForm] = useState<FormState>(() =>
    isEdit ? defaultForm((props as EditMode).asset) : defaultForm()
  );
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [portfolioList, setPortfolioList] = useState<PortfolioOption[]>(
    !isEdit ? (props as AddMode).portfolios : []
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      set("symbol", value);
      if (timerRef.current) clearTimeout(timerRef.current);
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
      currency: r.currency || prev.currency,
    }));
    setResults([]);
    setDropdownOpen(false);
  }

  async function handleCreatePortfolio() {
    if (!newPortfolioName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPortfolioName.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to create portfolio.");
        setLoading(false);
        return;
      }
      const portfolio = await res.json();
      setPortfolioList((prev) => [...prev, { id: portfolio.id, name: portfolio.name }]);
      set("portfolioId", portfolio.id);
      setCreatingPortfolio(false);
      setNewPortfolioName("");
    } catch {
      setError("Failed to create portfolio.");
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = parseFloat(form.quantity);
    const abp = parseFloat(form.averageBuyPrice);

    if (!form.symbol.trim()) return setError("Symbol is required.");
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.assetType) return setError("Asset type is required.");
    if (!isEdit && !form.portfolioId) return setError("Portfolio is required.");
    if (isNaN(qty) || qty <= 0) return setError("Quantity must be a positive number.");
    if (isNaN(abp) || abp <= 0) return setError("Average buy price must be positive.");
    if (!form.currency.trim()) return setError("Currency is required.");

    setLoading(true);
    const payload = {
      portfolioId: form.portfolioId,
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim(),
      assetType: form.assetType,
      quantity: qty,
      averageBuyPrice: abp,
      currency: form.currency.trim().toUpperCase(),
      notes: form.notes.trim() || null,
    };

    const url = isEdit ? `/api/assets/${(props as EditMode).asset.id}` : "/api/assets";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "Something went wrong.");
      return;
    }

    props.onSuccess();
    props.onOpenChange(false);
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Portfolio</Label>
              {!creatingPortfolio ? (
                <div className="space-y-2">
                  <Select
                    value={form.portfolioId}
                    onValueChange={(v) => set("portfolioId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select portfolio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioList.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setCreatingPortfolio(true)}
                  >
                    + Create new portfolio
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Portfolio name..."
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreatePortfolio}
                    disabled={loading || !newPortfolioName.trim()}
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setCreatingPortfolio(false); setNewPortfolioName(""); }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="symbol">Symbol</Label>
            <div className="relative">
              <Input
                id="symbol"
                value={form.symbol}
                onChange={handleSymbolChange}
                placeholder="AAPL, BTC-USD..."
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
                        onMouseDown={(e) => { e.preventDefault(); handleSelectResult(r); }}
                      >
                        <span className="font-medium shrink-0">{r.symbol}</span>
                        <span className="text-muted-foreground text-xs truncate">{r.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Apple Inc." disabled={loading} />
          </div>

          <div className="space-y-1.5">
            <Label>Asset Type</Label>
            <Select value={form.assetType} onValueChange={(v) => set("assetType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{ASSET_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="0" step="any" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="averageBuyPrice">Avg Buy Price</Label>
              <Input id="averageBuyPrice" type="number" min="0" step="any" value={form.averageBuyPrice} onChange={(e) => set("averageBuyPrice", e.target.value)} disabled={loading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["USD", "EUR", "GBP", "TRY", "JPY", "CHF", "CAD", "AUD", "CNY", "HKD"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any notes about this position..." disabled={loading} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save changes" : "Add asset")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
