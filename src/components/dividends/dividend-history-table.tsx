"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/utils/format";
import { EmptyState } from "@/components/empty-state";
import { DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import type { DividendTransaction } from "@/services/dividend.service";

const PAGE_SIZE = 10;

interface Props {
  transactions: DividendTransaction[];
  currency?: string;
}

export function DividendHistoryTable({ transactions, currency = "USD" }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paged = useMemo(
    () => transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [transactions, page]
  );

  if (transactions.length === 0) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
        <CardHeader>
          <CardTitle>Dividend History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={DollarSign}
            title="No dividends recorded"
            description="Add dividend transactions to your assets to track your income."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Dividend History</CardTitle>
        <span className="text-sm text-muted-foreground">
          {transactions.length} payment{transactions.length !== 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Portfolio</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(t.date)}</TableCell>
                  <TableCell className="font-mono font-semibold">{t.assetSymbol}</TableCell>
                  <TableCell className="text-muted-foreground">{t.assetName}</TableCell>
                  <TableCell className="text-muted-foreground">{t.portfolioName}</TableCell>
                  <TableCell className="text-right font-medium text-positive">
                    +{formatCurrency(t.amount, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
