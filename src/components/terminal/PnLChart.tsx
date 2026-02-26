"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { generatePnLData } from "./mock-data";

export function PnLChart() {
  const data = useMemo(() => generatePnLData(), []);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-3">
      <h3 className="text-xs font-medium text-gray-300 mb-2">30-Day PnL</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pnlPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pnlNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#fff",
              }}
              formatter={(value: number) => [
                `$${value.toFixed(2)}`,
                "PnL",
              ]}
            />
            <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#22c55e"
              fill="url(#pnlPositive)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
