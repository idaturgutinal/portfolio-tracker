"use client";

import { useState } from "react";
import {
  MOCK_OPEN_ORDERS,
  MOCK_ORDER_HISTORY,
  MOCK_TRADE_HISTORY,
  MOCK_BALANCES,
} from "./mock-data";
import { PriceAlerts } from "./PriceAlerts";

type Tab = "openOrders" | "orderHistory" | "tradeHistory" | "balances" | "alerts";

interface BottomPanelProps {
  currentSymbol?: string;
}

export function BottomPanel({ currentSymbol = "BTCUSDT" }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("openOrders");
  const [hideZero, setHideZero] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "openOrders", label: "Open Orders" },
    { key: "orderHistory", label: "Order History" },
    { key: "tradeHistory", label: "Trade History" },
    { key: "balances", label: "Balances" },
    { key: "alerts", label: "Alerts" },
  ];

  const totalPortfolioValue = MOCK_BALANCES.reduce((sum, b) => sum + b.usdtValue, 0);

  const filteredBalances = hideZero
    ? MOCK_BALANCES.filter((b) => b.total > 0)
    : MOCK_BALANCES;

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
            {tab.key === "openOrders" && MOCK_OPEN_ORDERS.length > 0 && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-gray-700 rounded">{MOCK_OPEN_ORDERS.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "openOrders" && (
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
              {MOCK_OPEN_ORDERS.map((order) => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-3 py-2 font-mono text-gray-400">{order.date}</td>
                  <td className="px-3 py-2">{order.pair}</td>
                  <td className="px-3 py-2 text-gray-400">{order.type}</td>
                  <td className={`px-3 py-2 ${order.side === "Buy" ? "text-green-500" : "text-red-500"}`}>{order.side}</td>
                  <td className="px-3 py-2 text-right font-mono">{order.price.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">{order.amount}</td>
                  <td className="px-3 py-2 text-right font-mono">{order.filled}%</td>
                  <td className="px-3 py-2 text-center">
                    <button className="text-red-400 hover:text-red-300 text-xs">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "orderHistory" && (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium">Pair</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-right px-3 py-2 font-medium">Price</th>
                <th className="text-right px-3 py-2 font-medium">Amount</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDER_HISTORY.map((order) => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-3 py-2 font-mono text-gray-400">{order.date}</td>
                  <td className="px-3 py-2">{order.pair}</td>
                  <td className="px-3 py-2 text-gray-400">{order.type}</td>
                  <td className="px-3 py-2 text-right font-mono">{order.price.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">{order.amount}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      order.status === "Filled" ? "bg-green-500/20 text-green-400" :
                      order.status === "Cancelled" ? "bg-red-500/20 text-red-400" :
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

        {activeTab === "tradeHistory" && (
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
              {MOCK_TRADE_HISTORY.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-3 py-2 font-mono text-gray-400">{trade.date}</td>
                  <td className="px-3 py-2">{trade.pair}</td>
                  <td className={`px-3 py-2 ${trade.side === "Buy" ? "text-green-500" : "text-red-500"}`}>{trade.side}</td>
                  <td className="px-3 py-2 text-right font-mono">{trade.price.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">{trade.amount}</td>
                  <td className="px-3 py-2 text-right font-mono text-gray-400">{trade.fee.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono">{trade.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "balances" && (
          <div>
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
              <span className="text-sm">
                Total Portfolio Value: <span className="font-mono font-bold text-yellow-500">${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
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
                  <tr key={balance.coin} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-3 py-2 font-medium">{balance.coin}</td>
                    <td className="px-3 py-2 text-right font-mono">{balance.total.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono">{balance.available.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-400">{balance.locked.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono">${balance.usdtValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "alerts" && (
          <PriceAlerts currentSymbol={currentSymbol} />
        )}
      </div>
    </div>
  );
}
