"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { AddTransactionDialog } from "./add-transaction-dialog";
import { formatCurrency, formatDate } from "@/utils/format";
import type { AssetOption, EnrichedTransaction } from "@/types";
import { Download, Plus, RefreshCw, ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const TYPE_BADGE: Record<string, string> = {
  BUY: "bg-green-100 text-green-700",
  SELL: "bg-red-100 text-red-700",
  DIVIDEND: "bg-blue-100 text-blue-700",
};

const TYPE_LABELS: Record<string, string> = {
  BUY: "Buy",
  SELL: "Sell",
  DIVIDEND: "Dividend",
};

// ── CSV export ────────────────────────────────────────────────────────────────

function exportToCSV(transactions: EnrichedTransaction[]) {
  const headers = [
    "Date",
    "Portfolio",
    "Symbol",
    "Name",
    "Type",
    "Quantity",
    "Price/Unit",
    "Fees",
    "Total",
    "Notes",
  ];

  const esc = (v: string | number | null | undefined) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.portfolioName,
    t.assetSymbol,
    t.assetName,
    t.type,
    t.quantity,
    t.pricePerUnit,
    t.fees,
    t.total,
    t.notes ?? "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialTransactions: EnrichedTransaction[];
  assetOptions: AssetOption[];
  currency?: string;
}

export function TransactionsTable({ initialTransactions, assetOptions, currency = "USD" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Unique assets that appear in the transaction list (for the asset filter dropdown)
  const txAssets = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of initialTransactions) {
      if (!seen.has(t.assetId)) seen.set(t.assetId, t.assetSymbol);
    }
    return [...seen.entries()].map(([id, symbol]) => ({ id, symbol }));
  }, [initialTransactions]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return initialTransactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (assetFilter !== "all" && t.assetId !== assetFilter) return false;
      const txDay = t.date.split("T")[0]; // YYYY-MM-DD in UTC
      if (dateFrom && txDay < dateFrom) return false;
      if (dateTo && txDay > dateTo) return false;
      return true;
    });
  }, [initialTransactions, typeFilter, assetFilter, dateFrom, dateTo]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, assetFilter, dateFrom, dateTo]);

  const hasFilters =
    dateFrom || dateTo || assetFilter !== "all" || typeFilter !== "all";

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setAssetFilter("all");
    setTypeFilter("all");
  }

  function refresh() {
    startTransition(() => router.refresh());
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground whitespace-nowrap">From</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">To</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
          />
        </div>

        <Select value={assetFilter} onValueChange={setAssetFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All assets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assets</SelectItem>
            {txAssets.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="BUY">Buy</SelectItem>
            <SelectItem value="SELL">Sell</SelectItem>
            <SelectItem value="DIVIDEND">Dividend</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          {filtered.length !== initialTransactions.length &&
            ` (of ${initialTransactions.length})`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isPending}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button onClick={() => setAddOpen(true)} disabled={assetOptions.length === 0}>
            <Plus className="h-4 w-4 mr-1" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* No assets warning */}
      {assetOptions.length === 0 && (
        <p className="text-sm text-muted-foreground rounded-md border px-4 py-3">
          You need to add assets before recording transactions. Visit the{" "}
          <Link href="/dashboard/assets" className="underline underline-offset-4">
            Assets
          </Link>{" "}
          page first.
        </p>
      )}

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={initialTransactions.length === 0 ? "No transactions yet" : "No transactions match your filters"}
          description={
            initialTransactions.length === 0
              ? "Record your first buy, sell, or dividend to start tracking."
              : "Try adjusting your date range, asset, or type filters."
          }
        />
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="hidden sm:table-cell">Portfolio</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Quantity</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Price / Unit</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Fees</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums">
                      {formatDate(t.date)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-sm">
                          {t.assetSymbol}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {t.assetName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {t.portfolioName}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TYPE_BADGE[t.type] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {TYPE_LABELS[t.type] ?? t.type}
                      </span>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-right tabular-nums">
                      {t.quantity}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-right tabular-nums whitespace-nowrap">
                      {formatCurrency(t.pricePerUnit, currency)}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-right tabular-nums whitespace-nowrap">
                      {t.fees > 0 ? (
                        formatCurrency(t.fees, currency)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right tabular-nums font-medium whitespace-nowrap">
                      {formatCurrency(t.total, currency)}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[180px]">
                      {t.notes ? (
                        <span className="block truncate" title={t.notes}>
                          {t.notes}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add dialog */}
      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        assetOptions={assetOptions}
        onSuccess={refresh}
      />
    </div>
  );
}
