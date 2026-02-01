"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import type { PerformanceData, PerformancePoint } from "@/types";
import { formatCompactNumber } from "@/lib/utils";

export type ViewMode = "portfolio" | "by_category" | "benchmarks";

const CATEGORY_COLORS: Record<string, string> = {
  Equity: "#3B82F6",
  Funds: "#8B5CF6",
  Crypto: "#F59E0B",
  Gold: "#EAB308",
  "Fixed Income": "#10B981",
  "Real Estate": "#EC4899",
  Other: "#6B7280",
};

const BENCHMARK_COLORS: Record<string, string> = {
  "Nifty 50": "#F97316",
  "Sensex": "#06B6D4",
  "S&P 500": "#8B5CF6",
  "Gold": "#EAB308",
  "Bitcoin": "#F59E0B",
};

interface PerformanceChartProps {
  data: PerformanceData | PerformancePoint[];
  viewMode: ViewMode;
}

export default function PerformanceChart({ data, viewMode }: PerformanceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Handle both old (array) and new (object) format
  const perfData: PerformanceData = useMemo(() => {
    if (Array.isArray(data)) {
      return { portfolio: data, by_category: {}, benchmarks: {} };
    }
    return data;
  }, [data]);

  const portfolioData = perfData.portfolio || [];
  const categories = Object.keys(perfData.by_category || {});
  const benchmarks = Object.keys(perfData.benchmarks || {});
  const hasCategoryData = categories.length > 0;
  const hasBenchmarkData = benchmarks.length > 0;

  if (!portfolioData.length) {
    return <div className="text-center text-gray-500 dark:text-gray-400 py-8">No performance data</div>;
  }

  // Build merged dataset for by-category view
  const categoryChartData = useMemo(() => {
    if (!hasCategoryData) return [];
    const dateMap: Record<string, Record<string, number>> = {};
    for (const [cat, points] of Object.entries(perfData.by_category)) {
      for (const p of points) {
        if (!dateMap[p.date]) dateMap[p.date] = { date: p.date as unknown as number };
        (dateMap[p.date] as Record<string, unknown>)[cat] = p.value;
      }
    }
    return Object.values(dateMap).sort((a, b) =>
      String((a as Record<string, unknown>).date).localeCompare(String((b as Record<string, unknown>).date))
    );
  }, [perfData.by_category, hasCategoryData]);

  // Build merged dataset for benchmark view (portfolio + benchmarks)
  const benchmarkChartData = useMemo(() => {
    if (!hasBenchmarkData) return [];
    const dateMap: Record<string, Record<string, unknown>> = {};
    for (const p of portfolioData) {
      if (!dateMap[p.date]) dateMap[p.date] = {};
      dateMap[p.date].date = p.date;
      dateMap[p.date]["Your Portfolio"] = p.value;
    }
    for (const [name, points] of Object.entries(perfData.benchmarks)) {
      for (const p of points) {
        if (!dateMap[p.date]) dateMap[p.date] = { date: p.date };
        dateMap[p.date][name] = p.value;
      }
    }
    return Object.values(dateMap).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
  }, [perfData.benchmarks, portfolioData, hasBenchmarkData]);

  const tickFormatter = (val: string) => {
    const d = new Date(val);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const tooltipStyle = {
    backgroundColor: isDark ? "#0B1C2E" : "#fff",
    border: `1px solid ${isDark ? "#15283D" : "#e5e7eb"}`,
    borderRadius: "8px",
    color: isDark ? "#fff" : undefined,
  };

  return (
    <div>
      {/* Portfolio view (area chart) */}
      {viewMode === "portfolio" && (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4F358" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4F358" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#15283D" : "#e5e7eb"} opacity={isDark ? 0.6 : 0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }} tickFormatter={tickFormatter} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }} tickFormatter={formatCompactNumber} width={60} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number) => [formatCompactNumber(value), "Value"]}
              contentStyle={tooltipStyle}
            />
            <Area type="monotone" dataKey="value" stroke="#D4F358" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* By asset class view (multi-line) */}
      {viewMode === "by_category" && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={categoryChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#15283D" : "#e5e7eb"} opacity={isDark ? 0.6 : 0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }} tickFormatter={tickFormatter} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }} tickFormatter={formatCompactNumber} width={60} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number, name: string) => [formatCompactNumber(value), name]}
              contentStyle={tooltipStyle}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            {categories.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={CATEGORY_COLORS[cat] || "#6B7280"}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Benchmark comparison view (multi-line) */}
      {viewMode === "benchmarks" && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={benchmarkChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#15283D" : "#e5e7eb"} opacity={isDark ? 0.6 : 0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }} tickFormatter={tickFormatter} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : undefined }} tickFormatter={formatCompactNumber} width={60} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value: number, name: string) => [formatCompactNumber(value), name]}
              contentStyle={tooltipStyle}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Line type="monotone" dataKey="Your Portfolio" stroke={isDark ? "#D4F358" : "#16a34a"} strokeWidth={2.5} dot={false} />
            {benchmarks.map((name) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={BENCHMARK_COLORS[name] || "#9ca3af"}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
