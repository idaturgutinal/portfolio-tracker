"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { PortfolioOption, EnrichedAsset } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolios: PortfolioOption[];
  assets: EnrichedAsset[];
  onDeleted: (id: string) => void;
  onRefresh: () => void;
}

export function ManagePortfoliosDialog({
  open,
  onOpenChange,
  portfolios,
  assets,
  onDeleted,
  onRefresh,
}: Props) {
  const [pendingDelete, setPendingDelete] = useState<PortfolioOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!pendingDelete) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Failed to delete portfolio.");
        setLoading(false);
        return;
      }
      onDeleted(pendingDelete.id);
      setPendingDelete(null);
      onRefresh();
    } catch {
      setError("Failed to delete portfolio.");
    }
    setLoading(false);
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) setError(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Portfolios</DialogTitle>
            <DialogDescription>
              Delete empty portfolios you no longer need.
            </DialogDescription>
          </DialogHeader>
          {error && !pendingDelete && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {portfolios.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No portfolios yet.</p>
          ) : (
            <ul className="space-y-2">
              {portfolios.map((p) => {
                const assetCount = assets.filter((a) => a.portfolioId === p.id).length;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {assetCount} asset{assetCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => { setPendingDelete(p); setError(null); }}
                      title="Delete portfolio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete portfolio confirmation */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(o) => {
          if (!o) { setPendingDelete(null); setError(null); }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{pendingDelete?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              This will permanently delete the portfolio. Portfolios with assets cannot be deleted — remove the assets first.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
