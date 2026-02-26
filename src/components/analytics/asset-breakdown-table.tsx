"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart2 } from "lucide-react";
import type { AssetMetric } from "@/services/dashboard.service";
import { ASSET_TYPE_LABELS } from "@/lib/constants";

type SortKey = "symbol" | "value" | "gainLoss" | "gainLossPct";
type SortDir = "asc" | "desc";

interface Props {
  assets: AssetMetric[];
  currency?: string;
}

function SortIcon({
  field,
  sortKey,
  sortDir,
}: {
  field: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (field !== sortKey)
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  return sortDir === "asc" ? (
    <ArrowUp className="h-3 w-3 ml-1" />
  ) : (
    <ArrowDown className="h-3 w-3 ml-1" />
  );
}

function SortButton({
  field,
  sortKey,
  sortDir,
  onSort,
  children,
}: {
  field: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => onSort(field)}
    >
      {children}
      <SortIcon field={field} sortKey={sortKey} sortDir={sortDir} />
    </Button>
  );
}

export function AssetBreakdownTable({ assets, currency = "USD" }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("gainLossPct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart2}
            title="No assets yet"
            description="Add assets to your portfolios to see the breakdown."
          />
        </CardContent>
      </Card>
    );
  }

  const sorted = [...assets].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "symbol":
        return dir * a.symbol.localeCompare(b.symbol);
      case "value":
        return dir * (a.value - b.value);
      case "gainLoss":
        return dir * (a.gainLoss - b.gainLoss);
      case "gainLossPct":
        return dir * (a.gainLossPct - b.gainLossPct);
    }
  });

  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const winners = assets.filter((a) => a.gainLoss >= 0).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Asset Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} &middot;{" "}
            {winners} profitable &middot; win rate{" "}
            {assets.length > 0
              ? Math.round((winners / assets.length) * 100)
              : 0}
            %
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-b-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton
                    field="symbol"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Asset
                  </SortButton>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right hidden lg:table-cell">
                  Qty
                </TableHead>
                <TableHead className="text-right hidden lg:table-cell">
                  Avg Cost
                </TableHead>
                <TableHead className="text-right hidden md:table-cell">
                  Price
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    field="value"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Value
                  </SortButton>
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Weight
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    field="gainLoss"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    P&amp;L
                  </SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    field="gainLossPct"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Return
                  </SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a) => {
                const positive = a.gainLoss >= 0;
                const weight =
                  totalValue > 0 ? (a.value / totalValue) * 100 : 0;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-semibold text-sm">
                          {a.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {a.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ASSET_TYPE_LABELS[a.assetType] ?? a.assetType}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right tabular-nums hidden lg:table-cell text-sm text-muted-foreground">
                      {a.quantity.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}
                    </TableCell>

                    <TableCell className="text-right tabular-nums hidden lg:table-cell text-sm text-muted-foreground">
                      {formatCurrency(a.averageBuyPrice, currency)}
                    </TableCell>

                    <TableCell className="text-right tabular-nums hidden md:table-cell text-sm">
                      {a.currentPrice != null ? (
                        formatCurrency(a.currentPrice, currency)
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right tabular-nums font-medium whitespace-nowrap">
                      {formatCurrency(a.value, currency)}
                    </TableCell>

                    <TableCell className="text-right tabular-nums hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {weight.toFixed(1)}%
                    </TableCell>

                    <TableCell
                      className={`text-right tabular-nums whitespace-nowrap text-sm ${
                        positive ? "text-positive" : "text-negative"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {formatCurrency(a.gainLoss, currency)}
                    </TableCell>

                    <TableCell
                      className={`text-right tabular-nums font-semibold whitespace-nowrap ${
                        positive ? "text-positive" : "text-negative"
                      }`}
                    >
                      {formatPercent(a.gainLossPct)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
