"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Trash2, ChevronUp, ChevronDown, Power } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: "ABOVE" | "BELOW";
  isActive: boolean;
  triggeredAt: string | null;
  notifyEmail: boolean;
  createdAt: string;
}

interface PriceAlertsProps {
  currentSymbol: string;
}

export function PriceAlerts({ currentSymbol }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState(currentSymbol);
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/binance/alerts");
      if (res.ok) {
        const data = (await res.json()) as PriceAlert[];
        setAlerts(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    setSymbol(currentSymbol);
  }, [currentSymbol]);

  const handleCreate = async () => {
    const price = parseFloat(targetPrice);
    if (!symbol || isNaN(price) || price <= 0) {
      toast({ title: "Invalid input", description: "Please enter a valid symbol and price.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/binance/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, targetPrice: price, direction, notifyEmail }),
      });

      if (res.ok) {
        toast({ title: "Alert created", variant: "success" });
        setTargetPrice("");
        setShowForm(false);
        await fetchAlerts();
      } else {
        const data = (await res.json()) as { error?: string };
        toast({ title: "Error", description: data.error ?? "Failed to create alert.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create alert.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/binance/alerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a)));
      }
    } catch {
      toast({ title: "Error", description: "Failed to toggle alert.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/binance/alerts/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        toast({ title: "Alert deleted", variant: "success" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete alert.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-xs">
        Loading alerts...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Header with add button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="flex items-center gap-1.5 text-sm text-gray-300">
          <Bell className="h-3.5 w-3.5" />
          Price Alerts ({alerts.length}/20)
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded hover:bg-yellow-500/30 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-3 py-2 border-b border-gray-800 space-y-2 bg-gray-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g. BTCUSDT)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Target Price"
              className="w-28 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => setDirection("ABOVE")}
                className={`px-2 py-1 rounded text-[10px] transition-colors ${
                  direction === "ABOVE"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "text-gray-400 border border-gray-700 hover:text-gray-200"
                }`}
              >
                <ChevronUp className="h-3 w-3 inline mr-0.5" />
                Above
              </button>
              <button
                onClick={() => setDirection("BELOW")}
                className={`px-2 py-1 rounded text-[10px] transition-colors ${
                  direction === "BELOW"
                    ? "bg-red-500/20 text-red-400 border border-red-500/50"
                    : "text-gray-400 border border-gray-700 hover:text-gray-200"
                }`}
              >
                <ChevronDown className="h-3 w-3 inline mr-0.5" />
                Below
              </button>
            </div>
            <label className="flex items-center gap-1 text-gray-400 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800"
              />
              Email
            </label>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-3 py-1 bg-yellow-500 text-gray-900 rounded font-medium hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              {submitting ? "..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <div className="flex-1 overflow-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2 py-8">
            <Bell className="h-8 w-8 text-gray-600" />
            <p>No price alerts yet</p>
            <p className="text-[10px]">Click &quot;Add&quot; to create your first alert</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left px-3 py-1.5 font-medium">Symbol</th>
                <th className="text-right px-3 py-1.5 font-medium">Target</th>
                <th className="text-center px-3 py-1.5 font-medium">Direction</th>
                <th className="text-center px-3 py-1.5 font-medium">Status</th>
                <th className="text-center px-3 py-1.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-3 py-1.5 font-medium">{alert.symbol}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{alert.targetPrice.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      alert.direction === "ABOVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {alert.direction === "ABOVE" ? "Above" : "Below"}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <button
                      onClick={() => handleToggle(alert.id, alert.isActive)}
                      title={alert.isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className={`h-3.5 w-3.5 ${alert.isActive ? "text-green-400" : "text-gray-600"}`} />
                    </button>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
