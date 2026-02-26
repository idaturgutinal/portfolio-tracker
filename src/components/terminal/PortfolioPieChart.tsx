"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PORTFOLIO_DISTRIBUTION } from "./mock-data";

export function PortfolioPieChart() {
  const total = PORTFOLIO_DISTRIBUTION.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-3">
      <h3 className="text-xs font-medium text-gray-300 mb-2">Portfolio Distribution</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PORTFOLIO_DISTRIBUTION}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              dataKey="value"
              stroke="none"
            >
              {PORTFOLIO_DISTRIBUTION.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#fff",
              }}
              formatter={(value: number) => [
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${((value / total) * 100).toFixed(1)}%)`,
                "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {PORTFOLIO_DISTRIBUTION.map((item) => (
          <div key={item.name} className="flex items-center gap-1 text-[10px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
