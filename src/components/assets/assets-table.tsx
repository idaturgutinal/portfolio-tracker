"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssetFormDialog } from "./asset-form-dialog";
import { formatCurrency, formatPercent } from "@/utils/format";
import type { EnrichedAsset, PortfolioOption } from "@/types";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";

// ── Constants ─────────────────────────────────────────────────────────────────

const ASSET_TYPES = ["STOCK", "CRYPTO", "ETF", "MUTUAL_FUND", "BOND"] as const;

const TYPE_LABELS: Record<string, string> = {
  STOCK: "Stock",
  CRYPTO: "Crypto",
  ETF: "ETF",
  MUTUAL_FUND: "Mutual Fund",
  BOND: "Bond",
};

const TYPE_BADGE: Record<string, string> = {
  STOCK: "bg-blue-100 text-blue-700",
  CRYPTO: "bg-orange-100 text-orange-700",
  ETF: "bg-green-100 text-green-700",
  MUTUAL_FUND: "bg-purple-100 text-purple-700",
  BOND: "bg-gray-100 text-gray-600",
};

type SortField = keyof Pick<
  EnrichedAsset,
  | "symbol"
  | "name"
  | "assetType"
  | "quantity"
  | "averageBuyPrice"
  | "currentPrice"
  | "marketValue"
  | "pnl"
  | "pnlPct"
>;

// ── Sortable header ───────────────────────────────────────────────────────────

function SortHead({
  label,
  field,
  active,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  active: boolean;
  dir: "asc" | "desc";
  onSort: (f: SortField) => void;
}) {
  return (
    <button
      className="flex items-center gap-1 font-medium hover:text-foreground whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialAssets: EnrichedAsset[];
  portfolios: PortfolioOption[];
  currency?: string;
}

export function AssetsTable({ initialAssets, portfolios, currency = "USD" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [assets, setAssets] = useState(initialAssets);

  // Toolbar
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Sort
  const [sortField, setSortField] = useState<SortField>("marketValue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<EnrichedAsset | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EnrichedAsset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Filtering + sorting ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = assets;
    if (typeFilter && typeFilter !== "all") {
      list = list.filter((a) => a.assetType === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assets, typeFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/assets/${pendingDelete.id}`, {
      method: "DELETE",
    });
    setDeleteLoading(false);
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== pendingDelete.id));
      setPendingDelete(null);
      refresh();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search symbol or name…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 shrink-0">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isPending}
            title="Refresh prices"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Empty state rendered above the table */}
      {sorted.length === 0 && assets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No assets yet"
          description="Add your first holding to start tracking your portfolio."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Asset
            </Button>
          }
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No assets match your filters"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        /* Table */
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortHead label="Symbol" field="symbol" active={sortField === "symbol"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortHead label="Name" field="name" active={sortField === "name"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortHead label="Type" field="assetType" active={sortField === "assetType"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell text-muted-foreground font-medium">Portfolio</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortHead label="Qty" field="quantity" active={sortField === "quantity"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortHead label="Avg Buy" field="averageBuyPrice" active={sortField === "averageBuyPrice"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortHead label="Current" field="currentPrice" active={sortField === "currentPrice"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortHead label="Market Value" field="marketValue" active={sortField === "marketValue"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortHead label="P&L" field="pnl" active={sortField === "pnl"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortHead label="P&L %" field="pnlPct" active={sortField === "pnlPct"} dir={sortDir} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.map((asset) => {
                const positive = asset.pnl >= 0;
                const pnlClass = positive ? "text-positive" : "text-negative";
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono font-semibold whitespace-nowrap">
                      {asset.symbol}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[180px]">
                      <span className="block truncate" title={asset.name}>
                        {asset.name}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TYPE_BADGE[asset.assetType] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {TYPE_LABELS[asset.assetType] ?? asset.assetType}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm whitespace-nowrap">
                      {asset.portfolioName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell tabular-nums">{asset.quantity}</TableCell>
                    <TableCell className="hidden sm:table-cell tabular-nums whitespace-nowrap">
                      {formatCurrency(asset.averageBuyPrice)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell tabular-nums whitespace-nowrap">
                      {asset.currentPrice != null ? (
                        formatCurrency(asset.currentPrice, currency)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums font-medium whitespace-nowrap">
                      {formatCurrency(asset.marketValue, currency)}
                    </TableCell>
                    <TableCell className={`hidden md:table-cell tabular-nums whitespace-nowrap ${pnlClass}`}>
                      {(positive ? "+" : "−") +
                        formatCurrency(Math.abs(asset.pnl), currency)}
                    </TableCell>
                    <TableCell className={`tabular-nums whitespace-nowrap ${pnlClass}`}>
                      {formatPercent(asset.pnlPct)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingAsset(asset)}
                          title="Edit asset"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(asset)}
                          title="Delete asset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary row */}
      {sorted.length > 0 && assets.length > 0 && (
        <p className="text-sm text-muted-foreground text-right">
          {sorted.length} asset{sorted.length !== 1 ? "s" : ""} ·{" "}
          total value{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(sorted.reduce((s, a) => s + a.marketValue, 0), currency)}
          </span>
        </p>
      )}

      {/* Add dialog */}
      {addOpen && (
        <AssetFormDialog
          mode="add"
          portfolios={portfolios}
          open={addOpen}
          onOpenChange={setAddOpen}
          onSuccess={refresh}
        />
      )}

      {/* Edit dialog */}
      {editingAsset && (
        <AssetFormDialog
          mode="edit"
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(open) => {
            if (!open) setEditingAsset(null);
          }}
          onSuccess={refresh}
        />
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.symbol}?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <strong>{pendingDelete?.name}</strong> and all its transaction
              history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
