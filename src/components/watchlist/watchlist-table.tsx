"use client";

import { useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { AddWatchlistDialog } from "./add-watchlist-dialog";
import { formatCurrency, formatPercent, formatDate } from "@/utils/format";
import { Plus, RefreshCw, Eye, TrendingUp, TrendingDown } from "lucide-react";
import type { WatchlistRow } from "@/types";
import { EmptyState } from "@/components/empty-state";

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK: "Stock",
  CRYPTO: "Crypto",
  ETF: "ETF",
  MUTUAL_FUND: "Mutual Fund",
  BOND: "Bond",
};

interface Props {
  initialItems: WatchlistRow[];
}

export function WatchlistTable({ initialItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState(initialItems);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} symbol{items.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isPending}
            title="Refresh prices"
          >
            <RefreshCw
              className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Symbol
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Your watchlist is empty"
          description="Add symbols you want to track without committing to a position."
        />
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right hidden md:table-cell">
                  Change %
                </TableHead>
                <TableHead className="hidden sm:table-cell">Added</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => {
                const positive = (item.changePercent ?? 0) >= 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-sm">
                          {item.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ASSET_TYPE_LABELS[item.assetType] ?? item.assetType}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right tabular-nums font-medium whitespace-nowrap">
                      {item.currentPrice != null ? (
                        formatCurrency(item.currentPrice, item.currency)
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {item.change != null ? (
                        <span
                          className={
                            positive ? "text-positive" : "text-negative"
                          }
                        >
                          {item.change >= 0 ? "+" : ""}
                          {formatCurrency(item.change, item.currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right tabular-nums hidden md:table-cell whitespace-nowrap">
                      {item.changePercent != null ? (
                        <span
                          className={`flex items-center justify-end gap-1 ${
                            positive ? "text-positive" : "text-negative"
                          }`}
                        >
                          {positive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercent(item.changePercent)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(item.addedAt)}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddWatchlistDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => {
          setAddOpen(false);
          refresh();
        }}
      />
    </div>
  );
}