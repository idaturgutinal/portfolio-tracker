"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Eye, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";

interface ApiKeyItem {
  id: string;
  label: string;
  maskedApiKey: string;
  permissions: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [label, setLabel] = useState("");
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<ApiKeyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/binance/keys");
      if (res.ok) {
        const data = (await res.json()) as ApiKeyItem[];
        setKeys(data);
      }
    } catch {
      toast({ title: "Failed to load API keys", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!apiKey.trim()) {
      setFormError("API Key is required.");
      return;
    }
    if (!secretKey.trim()) {
      setFormError("Secret Key is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/binance/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          secretKey: secretKey.trim(),
          label: label.trim() || "Default",
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFormError(data.error ?? "Failed to add API key.");
        return;
      }

      toast({ title: "API key added successfully", variant: "success" });
      setApiKey("");
      setSecretKey("");
      setLabel("");
      await fetchKeys();
    } catch {
      setFormError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(item: ApiKeyItem) {
    try {
      const res = await fetch(`/api/binance/keys/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      if (res.ok) {
        setKeys((prev) =>
          prev.map((k) =>
            k.id === item.id ? { ...k, isActive: !k.isActive } : k
          )
        );
        toast({
          title: `API key ${!item.isActive ? "activated" : "deactivated"}`,
        });
      }
    } catch {
      toast({ title: "Failed to update API key", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/binance/keys/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok || res.status === 204) {
        setKeys((prev) => prev.filter((k) => k.id !== deleteTarget.id));
        toast({ title: "API key deleted", variant: "success" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: "Failed to delete API key", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="container py-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Binance API Keys
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Manage your Binance API keys for trading.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New API Key
          </CardTitle>
          <CardDescription>
            Enter your Binance API credentials. They will be validated against
            Binance and encrypted before storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="e.g. Main Account, Bot Trading"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your Binance API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter your Binance Secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                autoComplete="off"
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>
                Your keys are encrypted with AES-256-GCM before storage.
              </span>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Validating & Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add API Key
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your API Keys</CardTitle>
          <CardDescription>
            {keys.length === 0 && !loading
              ? "No API keys added yet."
              : `${keys.length} key${keys.length !== 1 ? "s" : ""} configured.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Add your first Binance API key above to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {keys.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {item.label}
                      </span>
                      <Badge
                        variant={item.isActive ? "default" : "secondary"}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {item.maskedApiKey}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(item.createdAt)}
                      {item.lastUsedAt
                        ? ` \u00b7 Last used ${formatDate(item.lastUsedAt)}`
                        : " \u00b7 Never used"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(item)}
                      title={item.isActive ? "Deactivate" : "Activate"}
                    >
                      <Eye
                        className={`h-5 w-5 ${
                          item.isActive
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete API Key"
        description={
          <>
            Are you sure you want to delete the API key{" "}
            <strong>&quot;{deleteTarget?.label}&quot;</strong>? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        loading={deleting}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </main>
  );
}
