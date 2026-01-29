"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import type { PerformancePoint } from "@/types";
import { formatCompactNumber } from "@/lib/utils";

interface PerformanceChartProps {
  data: PerformancePoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!data.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">No performance data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4F358" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#D4F358" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#15283D" : "#e5e7eb"}
          opacity={isDark ? 0.6 : 0.3}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }}
          tickFormatter={(val) => {
            const d = new Date(val);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }}
          tickFormatter={(val) => formatCompactNumber(val)}
          width={60}
        />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
          formatter={(value: number) => [formatCompactNumber(value), "Value"]}
          contentStyle={{
            backgroundColor: isDark ? "#0B1C2E" : "#fff",
            border: `1px solid ${isDark ? "#15283D" : "#e5e7eb"}`,
            borderRadius: "8px",
            color: isDark ? "#fff" : undefined,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#D4F358"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
