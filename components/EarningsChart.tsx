"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

interface EarningsData {
  actual: number;
  estimate: number;
  period: string;
  symbol: string;
  surprise: number;
}

export default function EarningsChart({ data }: { data: EarningsData[] }) {
  // Finnhub returns newest first. For a timeline, we reverse it to show growth left-to-right.
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...data]
      .reverse()
      .slice(-4) // Show the last 4 quarters (1 year)
      .map((item) => ({
        ...item,
        // Format "2023-12-31" to "Q4 23" or similar for cleaner UI
        displayPeriod: item.period,
      }));
  }, [data]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[200px] text-gray-500">
        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Earnings data unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl border border-white/5 p-6 shadow-xl w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Earnings History
          </h3>
          <p className="text-[10px] text-gray-600 font-bold uppercase">
            Actual vs Wall St Estimate
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
            Quarterly EPS
          </span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff05"
              vertical={false}
            />
            <XAxis
              dataKey="displayPeriod"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4b5563", fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4b5563", fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                backgroundColor: "#0F1420",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: "0.05em",
                paddingBottom: "20px",
              }}
            />

            <Bar
              name="Estimate"
              dataKey="estimate"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
            <Bar
              name="Actual"
              dataKey="actual"
              radius={[4, 4, 0, 0]}
              barSize={16}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.actual >= entry.estimate ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
        <span className="text-[9px] text-gray-600 font-bold uppercase">
          Source: Finnhub Analytics
        </span>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-gray-500 font-bold uppercase">
              Beat
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[9px] text-gray-500 font-bold uppercase">
              Miss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
