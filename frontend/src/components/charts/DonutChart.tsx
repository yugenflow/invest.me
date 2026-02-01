"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "next-themes";
import type { AllocationItem } from "@/types";

interface DonutChartProps {
  data: AllocationItem[];
}

export default function DonutChart({ data }: DonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!data.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-base">No allocation data</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-64 h-64 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={110}
              dataKey="percentage"
              nameKey="asset_class_name"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              contentStyle={{
                backgroundColor: isDark ? "#0B1C2E" : "#fff",
                border: `1px solid ${isDark ? "#15283D" : "#e5e7eb"}`,
                borderRadius: "8px",
                fontSize: "14px",
                color: isDark ? "#fff" : undefined,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-3 w-full mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[15px]">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate font-medium">{item.asset_class_name}</span>
            <span className="ml-auto font-bold tabular-nums">{item.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
