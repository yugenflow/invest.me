"use client";

import { Trash2, Plus } from "lucide-react";
import Select from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import type { ImportRow } from "@/types";

const ASSET_CLASS_OPTIONS = [
  { value: "EQUITY_IN", label: "Indian Equity" },
  { value: "EQUITY_US", label: "US Equity" },
  { value: "MF", label: "Mutual Fund" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "FD", label: "Fixed Deposit" },
  { value: "GOLD", label: "Gold" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
];

interface EditableTableProps {
  rows: ImportRow[];
  onChange: (rows: ImportRow[]) => void;
  showAddRow?: boolean;
  duplicateSymbols?: Set<string>;
}

export default function EditableTable({
  rows,
  onChange,
  showAddRow,
  duplicateSymbols,
}: EditableTableProps) {
  const updateRow = (index: number, field: keyof ImportRow, value: string) => {
    const next = [...rows];
    const numericFields = ["quantity", "avg_buy_price"];
    if (numericFields.includes(field)) {
      (next[index] as any)[field] = value === "" ? 0 : parseFloat(value) || 0;
    } else {
      (next[index] as any)[field] = value;
    }
    onChange(next);
  };

  const deleteRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([
      ...rows,
      {
        symbol: "",
        name: "",
        quantity: 0,
        avg_buy_price: 0,
        asset_class_code: "EQUITY_IN",
        buy_currency: "INR",
      },
    ]);
  };

  const totalValue = rows.reduce(
    (sum, r) => sum + r.quantity * r.avg_buy_price,
    0,
  );

  const inputClass =
    "w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark-card text-base focus:outline-none focus:ring-1 focus:ring-brand-lime";

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Symbol</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Asset Class</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qty</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Price</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Currency</th>
              <th className="py-3 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isDupe = duplicateSymbols?.has(row.symbol?.toUpperCase());
              return (
              <tr
                key={i}
                className={`border-b border-gray-100 dark:border-gray-800 ${isDupe ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}
              >
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className={inputClass}
                      placeholder="Company Name"
                    />
                    {isDupe && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400">
                        Dupe
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={row.symbol}
                    onChange={(e) => updateRow(i, "symbol", e.target.value)}
                    className={inputClass}
                    placeholder="SYMBOL"
                  />
                </td>
                <td className="py-2 px-2">
                  <Select
                    id={`asset-${i}`}
                    value={row.asset_class_code}
                    onChange={(e) =>
                      updateRow(i, "asset_class_code", e.target.value)
                    }
                    options={ASSET_CLASS_OPTIONS}
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={row.quantity || ""}
                    onChange={(e) => updateRow(i, "quantity", e.target.value)}
                    className={`${inputClass} w-24 text-right`}
                    placeholder="0"
                    min="0"
                    step="any"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={row.avg_buy_price || ""}
                    onChange={(e) =>
                      updateRow(i, "avg_buy_price", e.target.value)
                    }
                    className={`${inputClass} w-28 text-right`}
                    placeholder="0.00"
                    min="0"
                    step="any"
                  />
                </td>
                <td className="py-2 px-2">
                  <Select
                    id={`ccy-${i}`}
                    value={row.buy_currency}
                    onChange={(e) =>
                      updateRow(i, "buy_currency", e.target.value)
                    }
                    options={CURRENCY_OPTIONS}
                  />
                </td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => deleteRow(i)}
                    className="p-1.5 text-gray-400 hover:text-alert-red transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddRow && (
        <button
          onClick={addRow}
          className="flex items-center gap-2 mt-4 text-base text-brand-lime hover:text-brand-lime-hover font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Row
        </button>
      )}

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
