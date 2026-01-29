"use client";

import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import type { Holding } from "@/types";

interface HoldingsTableProps {
  holdings: Holding[];
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
}

export default function HoldingsTable({ holdings, onEdit, onDelete }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-base">
        No holdings yet. Add your first investment above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-navy-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
            <th className="py-4 px-4 font-semibold">Asset</th>
            <th className="py-4 px-4 font-semibold">Price</th>
            <th className="py-4 px-4 font-semibold">Balance</th>
            <th className="py-4 px-4 font-semibold">Gain / Loss</th>
            <th className="py-4 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
          {holdings.map((h) => {
            const value = h.current_value ?? h.quantity * h.avg_buy_price;
            const gainLoss = h.gain_loss ?? 0;
            const gainLossPct = h.gain_loss_pct ?? 0;
            const isPositive = gainLoss >= 0;

            return (
              <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-bold text-[15px]">{h.name}</div>
                  {h.symbol && <div className="text-sm text-gray-400 font-medium">{h.symbol}</div>}
                </td>
                <td className="py-4 px-4 text-[15px] font-medium">
                  {formatCurrency(h.avg_buy_price, h.buy_currency)}
                </td>
                <td className="py-4 px-4 text-[15px] font-medium">
                  {formatCurrency(value, h.buy_currency)}
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[15px] font-bold ${isPositive ? "text-gain" : "text-alert-red"}`}>
                    {isPositive ? "+" : ""}{formatCurrency(gainLoss, h.buy_currency)}
                  </span>
                  <div className={`text-sm font-medium ${isPositive ? "text-gain" : "text-alert-red"}`}>
                    {isPositive ? "+" : ""}{gainLossPct.toFixed(2)}%
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => onEdit(h)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-full transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onDelete(h.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-full transition-colors text-alert-red"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
