"use client";

import { useState } from "react";
import Link from "next/link";
import { PriceAlerts } from "./PriceAlerts";
import { useBinanceBalances } from "@/hooks/useBinanceAccount";
import { useOpenOrders, useOrderHistory, useTradeHistory } from "@/hooks/useBinanceOrders";
import type { TickerData } from "@/hooks/useBinanceMarket";

type Tab = "openOrders" | "orderHistory" | "tradeHistory" | "balances" | "alerts";

interface BottomPanelProps {
  currentSymbol?: string;
  tickers: Map<string, TickerData>;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-red-400 text-sm">
      {message}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
      {text}
    </div>
  );
}

function NoApiKey() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-sm">
      <p>API key gerekli.</p>
      <Link href="/dashboard/settings" className="text-yellow-500 hover:text-yellow-400 mt-1">
        Settings &rarr; API Keys sayfasından ekleyin.
      </Link>
    </div>
  );
}

export function BottomPanel({ currentSymbol = "BTCUSDT", tickers }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("openOrders");
  const [hideZero, setHideZero] = useState(false);

  const { balances, isLoading: balancesLoading, error: balancesError, hasApiKey: balancesHasApiKey } = useBinanceBalances(tickers);
  const { orders: openOrders, isLoading: openLoading, error: openError, hasApiKey: openHasApiKey } = useOpenOrders();
  const { orders: historyOrders, isLoading: historyLoading, error: historyError, hasApiKey: historyHasApiKey } = useOrderHistory(currentSymbol);
  const { trades, isLoading: tradesLoading, error: tradesError, hasApiKey: tradesHasApiKey } = useTradeHistory(currentSymbol);

  const tabs: { key: Tab; label: string }[] = [
    { key: "openOrders", label: "Open Orders" },
    { key: "orderHistory", label: "Order History" },
    { key: "tradeHistory", label: "Trade History" },
    { key: "balances", label: "Balances" },
    { key: "alerts", label: "Alerts" },
  ];

  const filteredBalances = hideZero
    ? balances.filter((b) => b.total > 0)
    : balances;

  const totalPortfolioValue = balances.reduce((sum, b) => sum + b.usdtValue, 0);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-700 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? "text-yellow-500 border-yellow-500"
                : "text-gray-400 border-transparent hover:text-gray-200"
            }`}
          >
            {tab.label}
            {tab.key === "openOrders" && openOrders.length > 0 && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-gray-700 rounded">{openOrders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* ── Open Orders ─────────────────────────────────────────────── */}
        {activeTab === "openOrders" && (
          <>
            {!openHasApiKey && !openLoading && <NoApiKey />}
            {openLoading && openHasApiKey && <Spinner text="Loading open orders..." />}
            {openError && !openLoading && openHasApiKey && <ErrorMessage message={openError} />}
            {!openLoading && !openError && openHasApiKey && openOrders.length === 0 && (
              <EmptyState text="No open orders" />
            )}
            {!openLoading && !openError && openHasApiKey && openOrders.length > 0 && (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Pair</th>
                    <th className="text-left px-3 py-2 font-medium">Type</th>
                    <th className="text-left px-3 py-2 font-medium">Side</th>
                    <th className="text-right px-3 py-2 font-medium">Price</th>
                    <th className="text-right px-3 py-2 font-medium">Amount</th>
                    <th className="text-right px-3 py-2 font-medium">Filled</th>
                    <th className="text-center px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders.map((order) => {
                    const origQty = parseFloat(order.origQty);
                    const executedQty = parseFloat(order.executedQty);
                    const filledPct = origQty > 0 ? ((executedQty / origQty) * 100).toFixed(1) : "0";
                    return (
                      <tr key={order.orderId} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-mono text-gray-400">{formatDate(order.time)}</td>
                        <td className="px-3 py-2">{order.symbol}</td>
                        <td className="px-3 py-2 text-gray-400">{order.type}</td>
                        <td className={`px-3 py-2 ${order.side === "BUY" ? "text-green-500" : "text-red-500"}`}>
                          {order.side}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{parseFloat(order.price).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono">{origQty}</td>
                        <td className="px-3 py-2 text-right font-mono">{filledPct}%</td>
                        <td className="px-3 py-2 text-center">
                          <button disabled className="text-gray-600 text-xs cursor-not-allowed">Cancel</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── Order History ────────────────────────────────────────────── */}
        {activeTab === "orderHistory" && (
          <>
            {!historyHasApiKey && !historyLoading && <NoApiKey />}
            {historyLoading && historyHasApiKey && <Spinner text="Loading order history..." />}
            {historyError && !historyLoading && historyHasApiKey && <ErrorMessage message={historyError} />}
            {!historyLoading && !historyError && historyHasApiKey && historyOrders.length === 0 && (
              <EmptyState text={`No order history for ${currentSymbol}`} />
            )}
            {!historyLoading && !historyError && historyHasApiKey && historyOrders.length > 0 && (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Pair</th>
                    <th className="text-left px-3 py-2 font-medium">Type</th>
                    <th className="text-left px-3 py-2 font-medium">Side</th>
                    <th className="text-right px-3 py-2 font-medium">Price</th>
                    <th className="text-right px-3 py-2 font-medium">Amount</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyOrders.map((order) => (
                    <tr key={order.orderId} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-3 py-2 font-mono text-gray-400">{formatDate(order.time)}</td>
                      <td className="px-3 py-2">{order.symbol}</td>
                      <td className="px-3 py-2 text-gray-400">{order.type}</td>
                      <td className={`px-3 py-2 ${order.side === "BUY" ? "text-green-500" : "text-red-500"}`}>
                        {order.side}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{parseFloat(order.price).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono">{parseFloat(order.origQty)}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          order.status === "FILLED" ? "bg-green-500/20 text-green-400" :
                          order.status === "CANCELED" ? "bg-red-500/20 text-red-400" :
                          order.status === "NEW" ? "bg-blue-500/20 text-blue-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── Trade History ────────────────────────────────────────────── */}
        {activeTab === "tradeHistory" && (
          <>
            {!tradesHasApiKey && !tradesLoading && <NoApiKey />}
            {tradesLoading && tradesHasApiKey && <Spinner text="Loading trade history..." />}
            {tradesError && !tradesLoading && tradesHasApiKey && <ErrorMessage message={tradesError} />}
            {!tradesLoading && !tradesError && tradesHasApiKey && trades.length === 0 && (
              <EmptyState text={`No trade history for ${currentSymbol}`} />
            )}
            {!tradesLoading && !tradesError && tradesHasApiKey && trades.length > 0 && (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-left px-3 py-2 font-medium">Pair</th>
                    <th className="text-left px-3 py-2 font-medium">Side</th>
                    <th className="text-right px-3 py-2 font-medium">Price</th>
                    <th className="text-right px-3 py-2 font-medium">Amount</th>
                    <th className="text-right px-3 py-2 font-medium">Fee</th>
                    <th className="text-right px-3 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const price = parseFloat(trade.price);
                    const qty = parseFloat(trade.qty);
                    const total = price * qty;
                    return (
                      <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-3 py-2 font-mono text-gray-400">{formatDate(trade.time)}</td>
                        <td className="px-3 py-2">{trade.symbol}</td>
                        <td className={`px-3 py-2 ${trade.isBuyer ? "text-green-500" : "text-red-500"}`}>
                          {trade.isBuyer ? "BUY" : "SELL"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{price.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono">{qty}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-400">
                          {parseFloat(trade.commission).toFixed(4)} {trade.commissionAsset}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── Balances ────────────────────────────────────────────────── */}
        {activeTab === "balances" && (
          <div>
            {!balancesHasApiKey && !balancesLoading && <NoApiKey />}
            {balancesLoading && balancesHasApiKey && <Spinner text="Loading balances..." />}
            {balancesError && !balancesLoading && balancesHasApiKey && <ErrorMessage message={balancesError} />}
            {!balancesLoading && !balancesError && balancesHasApiKey && (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                  <span className="text-sm">
                    Total Portfolio Value:{" "}
                    <span className="font-mono font-bold text-yellow-500">
                      ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </span>
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideZero}
                      onChange={(e) => setHideZero(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800"
                    />
                    Hide zero balances
                  </label>
                </div>

                {filteredBalances.length === 0 ? (
                  <EmptyState text="No balances found" />
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-900">
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left px-3 py-2 font-medium">Coin</th>
                        <th className="text-right px-3 py-2 font-medium">Total</th>
                        <th className="text-right px-3 py-2 font-medium">Available</th>
                        <th className="text-right px-3 py-2 font-medium">Locked</th>
                        <th className="text-right px-3 py-2 font-medium">USDT Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBalances.map((balance) => (
                        <tr key={balance.asset} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="px-3 py-2 font-medium">{balance.asset}</td>
                          <td className="px-3 py-2 text-right font-mono">{balance.total.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono">{balance.free.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">{balance.locked.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono">
                            ${balance.usdtValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Alerts ──────────────────────────────────────────────────── */}
        {activeTab === "alerts" && (
          <PriceAlerts currentSymbol={currentSymbol} />
        )}
      </div>
    </div>
  );
}
