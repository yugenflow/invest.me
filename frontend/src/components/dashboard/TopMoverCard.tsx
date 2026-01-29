"use client";

import Card from "@/components/ui/Card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Holding } from "@/types";

interface TopMoverCardProps {
  holdings: Holding[];
}

export default function TopMoverCard({ holdings }: TopMoverCardProps) {
  if (!holdings.length) {
    return (
      <Card className="col-span-2 shadow-subtle flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">No holdings data</p>
      </Card>
    );
  }

  const topMover = holdings.reduce((best, h) => {
    const absPct = Math.abs(h.gain_loss_pct ?? 0);
    const bestPct = Math.abs(best.gain_loss_pct ?? 0);
    return absPct > bestPct ? h : best;
  }, holdings[0]);

  const pct = topMover.gain_loss_pct ?? 0;
  const isPositive = pct >= 0;
  const price = topMover.current_value
    ? topMover.current_value / (topMover.quantity || 1)
    : topMover.avg_buy_price;

  return (
    <Card className="col-span-2 shadow-subtle">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Top Mover</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-heading font-bold">{topMover.name}</p>
          {topMover.symbol && (
            <p className="text-sm text-gray-400 font-medium">{topMover.symbol}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-heading font-bold">{formatCurrency(price)}</p>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isPositive
                ? "bg-brand-lime/20 text-gain"
                : "bg-red-50 dark:bg-red-900/20 text-alert-red"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercent(pct)}
          </span>
        </div>
      </div>
    </Card>
  );
}
