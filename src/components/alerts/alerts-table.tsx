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
import { AddAlertDialog } from "./add-alert-dialog";
import { formatCurrency, formatDate } from "@/utils/format";
import { Plus, RefreshCw, Bell } from "lucide-react";
import type { AssetOption, PriceAlertRow } from "@/types";
import { EmptyState } from "@/components/empty-state";

interface Props {
  initialAlerts: PriceAlertRow[];
  assetOptions: AssetOption[];
}

export function AlertsTable({ initialAlerts, assetOptions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [alerts, setAlerts] = useState(initialAlerts);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    refresh();
  }

  async function handleReactivate(id: string) {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, active: true, triggeredAt: null } : a
      )
    );
    await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
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
            onClick={() => setAddOpen(true)}
            disabled={assetOptions.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Alert
          </Button>
        </div>
      </div>

      {assetOptions.length === 0 && (
        <p className="text-sm text-muted-foreground rounded-md border px-4 py-3">
          You need to add assets before creating alerts. Visit the{" "}
          <a href="/dashboard/assets" className="underline underline-offset-4">
            Assets
          </a>{" "}
          page first.
        </p>
      )}

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Create a price alert to get notified when an asset hits your target."
        />
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Target Price</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">Triggered</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    {a.active ? (
                      <Badge variant="outline" className="text-positive border-positive/40">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Triggered</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold text-sm">
                        {a.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {a.assetName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm capitalize">
                    {a.condition === "ABOVE" ? "Goes above" : "Falls below"}
                  </TableCell>

                  <TableCell className="text-right tabular-nums font-medium whitespace-nowrap">
                    {formatCurrency(a.targetPrice)}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(a.createdAt)}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {a.triggeredAt ? formatDate(a.triggeredAt) : <span className="text-muted-foreground/40">—</span>}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      {!a.active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivate(a.id)}
                        >
                          Reactivate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddAlertDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        assetOptions={assetOptions}
        onSuccess={refresh}
      />
    </div>
  );
}
