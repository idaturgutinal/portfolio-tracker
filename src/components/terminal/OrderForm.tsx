"use client";

import { useState, useMemo } from "react";

type OrderSide = "Buy" | "Sell";
type OrderType = "Market" | "Limit" | "Stop-Limit";

interface OrderFormProps {
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
}

export function OrderForm({ baseAsset, quoteAsset, currentPrice }: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>("Buy");
  const [orderType, setOrderType] = useState<OrderType>("Limit");
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState("");
  const [amount, setAmount] = useState("");

  const mockBalance = side === "Buy" ? 10000 : 0.5;
  const balanceAsset = side === "Buy" ? quoteAsset : baseAsset;

  const total = useMemo(() => {
    const p = orderType === "Market" ? currentPrice : parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return p * a;
  }, [price, amount, currentPrice, orderType]);

  const fee = total * 0.001;

  const setPercentage = (pct: number) => {
    if (side === "Buy") {
      const p = orderType === "Market" ? currentPrice : parseFloat(price) || currentPrice;
      if (p > 0) {
        setAmount(((mockBalance * pct) / 100 / p).toFixed(6));
      }
    } else {
      setAmount(((mockBalance * pct) / 100).toFixed(6));
    }
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (orderType === "Limit" && (!price || parseFloat(price) <= 0)) {
      alert("Please enter a valid price");
      return;
    }
    if (orderType === "Stop-Limit" && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      alert("Please enter a valid stop price");
      return;
    }
    alert(
      `${side} ${orderType} Order:\n` +
      `${baseAsset}/${quoteAsset}\n` +
      (orderType !== "Market" ? `Price: ${price}\n` : "") +
      (orderType === "Stop-Limit" ? `Stop: ${stopPrice}\n` : "") +
      `Amount: ${amount} ${baseAsset}\n` +
      `Total: ${total.toFixed(2)} ${quoteAsset}\n` +
      `Fee: ~${fee.toFixed(2)} ${quoteAsset}`
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Buy / Sell tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setSide("Buy")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            side === "Buy"
              ? "text-green-500 border-b-2 border-green-500 bg-green-500/5"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("Sell")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            side === "Sell"
              ? "text-red-500 border-b-2 border-red-500 bg-red-500/5"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Order type selector */}
        <div className="flex gap-1">
          {(["Limit", "Market", "Stop-Limit"] as OrderType[]).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                orderType === type
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Balance */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Available</span>
          <span className="font-mono">{mockBalance.toLocaleString()} {balanceAsset}</span>
        </div>

        {/* Stop Price (Stop-Limit only) */}
        {orderType === "Stop-Limit" && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Stop Price</label>
            <div className="relative">
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder="Stop Price"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Price (Limit / Stop-Limit) */}
        {orderType !== "Market" && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Price</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{baseAsset}</span>
          </div>
        </div>

        {/* Percentage buttons */}
        <div className="flex gap-1">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setPercentage(pct)}
              className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total</span>
          <span className="font-mono">{total.toFixed(2)} {quoteAsset}</span>
        </div>

        {/* Fee */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Est. Fee (0.1%)</span>
          <span className="font-mono text-gray-400">~{fee.toFixed(2)} {quoteAsset}</span>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className={`w-full py-2.5 rounded font-medium text-sm transition-colors ${
            side === "Buy"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {side} {baseAsset}
        </button>
      </div>
    </div>
  );
}
