"use client";

import Card from "@/components/ui/Card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PortfolioSummary } from "@/types";

interface NetWorthCardProps {
  summary: PortfolioSummary;
}

export default function NetWorthCard({ summary }: NetWorthCardProps) {
  const isPositive = summary.total_gain_loss >= 0;
  const isDayPositive = summary.day_change >= 0;

  return (
    <Card className="col-span-full lg:col-span-8">
      <p className="text-base text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">Net Worth</p>
      <div className="flex items-center gap-4 mb-3">
        <h2 className="text-5xl font-heading font-extrabold tracking-tight">
          {formatCurrency(summary.current_value)}
        </h2>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-base font-bold ${
            isPositive
              ? "bg-brand-lime/20 text-gain"
              : "bg-red-50 dark:bg-red-900/20 text-alert-red"
          }`}
        >
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {formatPercent(summary.total_gain_loss_pct)}
        </span>
      </div>
      <div className="border-t border-gray-100 dark:border-navy-700 pt-3">
        <p className="text-base text-gray-500 dark:text-gray-400 mb-1">Daily P&L</p>
        <span className={`text-2xl font-bold ${isDayPositive ? "text-gain" : "text-alert-red"}`}>
          {formatCurrency(summary.day_change)} ({formatPercent(summary.day_change_pct)})
        </span>
      </div>
    </Card>
  );
}
