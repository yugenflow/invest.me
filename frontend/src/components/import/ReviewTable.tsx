"use client";

import { formatCurrency } from "@/lib/utils";
import type { ImportRow } from "@/types";

interface ReviewTableProps {
  rows: ImportRow[];
}

export default function ReviewTable({ rows }: ReviewTableProps) {
  const totalValue = rows.reduce(
    (sum, r) => sum + r.quantity * r.avg_buy_price,
    0,
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Symbol</th>
              <th className="text-left py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</th>
              <th className="text-right py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qty</th>
              <th className="text-right py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Price</th>
              <th className="text-right py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="py-3 px-3 text-base font-semibold">{row.symbol}</td>
                <td className="py-3 px-3 text-base">{row.name}</td>
                <td className="py-3 px-3 text-base text-right">{row.quantity}</td>
                <td className="py-3 px-3 text-base text-right">
                  {formatCurrency(row.avg_buy_price, row.buy_currency)}
                </td>
                <td className="py-3 px-3 text-base text-right font-semibold">
                  {formatCurrency(
                    row.quantity * row.avg_buy_price,
                    row.buy_currency,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-base text-gray-500 dark:text-gray-400">
          {rows.length} holding{rows.length !== 1 ? "s" : ""}
        </span>
        <span className="text-base font-bold">
          Total value: {formatCurrency(totalValue)}
        </span>
      </div>
    </div>
  );
}
