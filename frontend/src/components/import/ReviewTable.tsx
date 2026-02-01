"use client";

import { formatCurrency } from "@/lib/utils";
import { getColumns } from "./EditableTable";
import type { ImportRow } from "@/types";

// Asset classes where user enters total amount instead of per-unit price
const AMOUNT_INVESTED_CLASSES = new Set([
  "MUTUAL_FUND", "GOLD_PHYSICAL", "GOLD_DIGITAL", "GOLD_SGB",
]);

const DERIVED_LABELS: Record<string, string> = {
  MUTUAL_FUND: "NAV",
  GOLD_PHYSICAL: "Price/gram",
  GOLD_DIGITAL: "Price/gram",
  GOLD_SGB: "Issue Price/unit",
};

interface ReviewTableProps {
  rows: ImportRow[];
  duplicateSymbols?: Set<string>;
  assetClassCode?: string;
  skippedIndices?: Set<number>;
}

export default function ReviewTable({ rows, duplicateSymbols, assetClassCode = "EQUITY_IN", skippedIndices }: ReviewTableProps) {
  const columns = getColumns(assetClassCode);

  const totalValue = rows.reduce(
    (sum, r, i) => {
      if (skippedIndices?.has(i)) return sum;
      return sum + (r.amount_invested || (r.quantity || 1) * r.avg_buy_price);
    },
    0,
  );

  const activeCount = skippedIndices ? rows.length - skippedIndices.size : rows.length;

  const getDerivedPrice = (row: ImportRow): number | null => {
    if (AMOUNT_INVESTED_CLASSES.has(row.asset_class_code) && row.amount_invested && row.quantity > 0) {
      return row.amount_invested / row.quantity;
    }
    return null;
  };

  const formatCell = (row: ImportRow, col: { key: string; type: string; align?: string }) => {
    const val = (row as Record<string, unknown>)[col.key];
    if (col.type === "number" && col.key === "amount_invested") {
      return formatCurrency(val as number, row.buy_currency);
    }
    if (col.type === "number" && col.key === "avg_buy_price") {
      return formatCurrency(val as number, row.buy_currency);
    }
    if (col.type === "number" && col.key === "interest_rate") {
      return val ? `${val}%` : "—";
    }
    if (col.type === "number") {
      return val || "—";
    }
    if (col.type === "date") {
      return val ? new Date(val as string).toLocaleDateString() : "—";
    }
    return (val as string) || "—";
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.align === "right" ? "text-right" : "text-left"} py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide`}
                >
                  {col.label}
                </th>
              ))}
              <th className="text-right py-3 px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isDupe = row.symbol && duplicateSymbols?.has(row.symbol.toUpperCase());
              const isSkipped = skippedIndices?.has(i);
              const derivedPrice = getDerivedPrice(row);
              const derivedLabel = DERIVED_LABELS[row.asset_class_code];
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-100 dark:border-gray-800 ${isSkipped ? "opacity-40 line-through" : ""} ${isDupe && !isSkipped ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}
                >
                  {columns.map((col) => {
                    const showDupe = col.key === "symbol" && isDupe;
                    return (
                      <td
                        key={col.key}
                        className={`py-3 px-3 text-base ${col.align === "right" ? "text-right" : ""} ${col.key === "name" ? "font-semibold" : ""}`}
                      >
                        {showDupe ? (
                          <span className="flex items-center gap-2">
                            {formatCell(row, col)}
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400">
                              Dupe
                            </span>
                          </span>
                        ) : (
                          formatCell(row, col)
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-base text-right font-semibold">
                    {formatCurrency(
                      row.amount_invested || (row.quantity || 1) * row.avg_buy_price,
                      row.buy_currency,
                    )}
                    {derivedPrice !== null && derivedLabel && (
                      <div className="text-xs font-normal text-gray-400 mt-0.5">
                        {derivedLabel}: {formatCurrency(derivedPrice, row.buy_currency)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-base text-gray-500 dark:text-gray-400">
          {skippedIndices && skippedIndices.size > 0
            ? `${activeCount} of ${rows.length} holding${rows.length !== 1 ? "s" : ""}`
            : `${rows.length} holding${rows.length !== 1 ? "s" : ""}`
          }
        </span>
        <span className="text-base font-bold">
          Total value: {formatCurrency(totalValue)}
        </span>
      </div>
    </div>
  );
}
