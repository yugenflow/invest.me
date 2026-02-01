"use client";

import { Trash2, Plus } from "lucide-react";
import Select from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import type { ImportRow } from "@/types";

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
];

// Column definitions per asset class category
// Each column: { key, label, type, placeholder, align, width, options? }
type ColDef = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  placeholder: string;
  align?: "left" | "right";
  width?: string;
  options?: { value: string; label: string }[];
};

const EXCHANGE_OPTIONS = [
  { value: "NSE", label: "NSE" },
  { value: "BSE", label: "BSE" },
];

function getColumns(assetClassCode: string): ColDef[] {
  switch (assetClassCode) {
    case "EQUITY_IN":
      return [
        { key: "name", label: "Name", type: "text", placeholder: "Company Name" },
        { key: "symbol", label: "Symbol", type: "text", placeholder: "RELIANCE" },
        { key: "exchange", label: "Exchange", type: "select", placeholder: "", options: EXCHANGE_OPTIONS },
        { key: "quantity", label: "Qty", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "avg_buy_price", label: "Avg Price", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "buy_currency", label: "Currency", type: "select", placeholder: "", options: CURRENCY_OPTIONS },
      ];
    case "EQUITY_US":
      return [
        { key: "name", label: "Name", type: "text", placeholder: "Company Name" },
        { key: "symbol", label: "Ticker", type: "text", placeholder: "AAPL" },
        { key: "quantity", label: "Qty", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "avg_buy_price", label: "Avg Price", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "buy_currency", label: "Currency", type: "select", placeholder: "", options: CURRENCY_OPTIONS },
      ];
    case "MUTUAL_FUND":
      return [
        { key: "name", label: "Fund Name", type: "text", placeholder: "Nippon India Small Cap Fund Direct Growth" },
        { key: "quantity", label: "Units", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "amount_invested", label: "Amount Invested", type: "number", placeholder: "0.00", align: "right", width: "w-36" },
        { key: "buy_currency", label: "Currency", type: "select", placeholder: "", options: CURRENCY_OPTIONS },
      ];
    case "CRYPTO":
      return [
        { key: "name", label: "Coin / Token", type: "text", placeholder: "Bitcoin" },
        { key: "symbol", label: "Symbol", type: "text", placeholder: "BTC" },
        { key: "quantity", label: "Qty", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "avg_buy_price", label: "Avg Price", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "buy_currency", label: "Currency", type: "select", placeholder: "", options: CURRENCY_OPTIONS },
      ];
    case "GOLD_PHYSICAL":
      return [
        { key: "name", label: "Description", type: "text", placeholder: "24K Gold Bar" },
        { key: "quantity", label: "Weight (g)", type: "number", placeholder: "0", align: "right", width: "w-28" },
        { key: "amount_invested", label: "Total Cost", type: "number", placeholder: "0.00", align: "right", width: "w-32" },
        { key: "buy_date", label: "Purchase Date", type: "date", placeholder: "" },
      ];
    case "GOLD_SGB":
      return [
        { key: "name", label: "Series / Name", type: "text", placeholder: "SGB 2024-25 Series I" },
        { key: "quantity", label: "Units (g)", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "amount_invested", label: "Total Cost", type: "number", placeholder: "0.00", align: "right", width: "w-32" },
        { key: "interest_rate", label: "Rate (%)", type: "number", placeholder: "2.50", align: "right", width: "w-24" },
        { key: "maturity_date", label: "Maturity", type: "date", placeholder: "" },
        { key: "institution", label: "Bank / Broker", type: "text", placeholder: "SBI" },
      ];
    case "GOLD_ETF":
      return [
        { key: "name", label: "ETF Name", type: "text", placeholder: "Nippon Gold ETF" },
        { key: "symbol", label: "Symbol", type: "text", placeholder: "GOLDBEES" },
        { key: "quantity", label: "Qty", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "avg_buy_price", label: "Avg Price", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "buy_currency", label: "Currency", type: "select", placeholder: "", options: CURRENCY_OPTIONS },
      ];
    case "GOLD_DIGITAL":
      return [
        { key: "name", label: "Platform", type: "text", placeholder: "Paytm Gold" },
        { key: "quantity", label: "Weight (g)", type: "number", placeholder: "0", align: "right", width: "w-28" },
        { key: "amount_invested", label: "Total Cost", type: "number", placeholder: "0.00", align: "right", width: "w-32" },
        { key: "institution", label: "Provider", type: "text", placeholder: "MMTC-PAMP" },
      ];
    case "FIXED_DEPOSIT":
      return [
        { key: "name", label: "FD Name", type: "text", placeholder: "HDFC Bank FD" },
        { key: "avg_buy_price", label: "Amount", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "interest_rate", label: "Rate (%)", type: "number", placeholder: "7.00", align: "right", width: "w-24" },
        { key: "maturity_date", label: "Maturity", type: "date", placeholder: "" },
        { key: "institution", label: "Bank", type: "text", placeholder: "HDFC Bank" },
      ];
    case "PPF":
      return [
        { key: "name", label: "Account Name", type: "text", placeholder: "PPF - SBI" },
        { key: "avg_buy_price", label: "Balance", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "institution", label: "Bank / PO", type: "text", placeholder: "SBI" },
      ];
    case "EPF":
      return [
        { key: "name", label: "Account Name", type: "text", placeholder: "EPF - Employer" },
        { key: "avg_buy_price", label: "Balance", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "institution", label: "Employer", type: "text", placeholder: "Company Name" },
      ];
    case "NPS":
      return [
        { key: "name", label: "Account Name", type: "text", placeholder: "NPS Tier-I" },
        { key: "avg_buy_price", label: "Balance", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "institution", label: "PFM", type: "text", placeholder: "HDFC Pension" },
      ];
    case "REAL_ESTATE":
      return [
        { key: "name", label: "Property Name", type: "text", placeholder: "2BHK Apartment, Mumbai" },
        { key: "avg_buy_price", label: "Purchase Value", type: "number", placeholder: "0.00", align: "right", width: "w-32" },
        { key: "buy_date", label: "Purchase Date", type: "date", placeholder: "" },
        { key: "institution", label: "Financer", type: "text", placeholder: "HDFC Home Loans" },
      ];
    case "BOND":
      return [
        { key: "name", label: "Bond Name", type: "text", placeholder: "REC Tax-Free Bond" },
        { key: "symbol", label: "Symbol", type: "text", placeholder: "RECLTD" },
        { key: "quantity", label: "Qty", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "avg_buy_price", label: "Face Value", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "interest_rate", label: "Coupon (%)", type: "number", placeholder: "7.50", align: "right", width: "w-24" },
        { key: "maturity_date", label: "Maturity", type: "date", placeholder: "" },
      ];
    case "OTHER":
      return [
        { key: "name", label: "Name", type: "text", placeholder: "Investment Name" },
        { key: "avg_buy_price", label: "Value", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "quantity", label: "Qty", type: "number", placeholder: "1", align: "right", width: "w-24" },
        { key: "institution", label: "Institution", type: "text", placeholder: "Optional" },
      ];
    default:
      return [
        { key: "name", label: "Name", type: "text", placeholder: "Name" },
        { key: "symbol", label: "Symbol", type: "text", placeholder: "SYMBOL" },
        { key: "quantity", label: "Qty", type: "number", placeholder: "0", align: "right", width: "w-24" },
        { key: "avg_buy_price", label: "Avg Price", type: "number", placeholder: "0.00", align: "right", width: "w-28" },
        { key: "buy_currency", label: "Currency", type: "select", placeholder: "", options: CURRENCY_OPTIONS },
      ];
  }
}

// Which asset classes don't need symbol for validation
const NO_SYMBOL_REQUIRED = new Set([
  "MUTUAL_FUND", "GOLD_PHYSICAL", "GOLD_SGB", "GOLD_DIGITAL",
  "FIXED_DEPOSIT", "PPF", "EPF", "NPS",
  "REAL_ESTATE", "OTHER",
]);

// Which asset classes don't use quantity (value-based instead)
const NO_QUANTITY_REQUIRED = new Set([
  "FIXED_DEPOSIT", "PPF", "EPF", "NPS", "REAL_ESTATE",
]);

interface EditableTableProps {
  rows: ImportRow[];
  onChange: (rows: ImportRow[]) => void;
  showAddRow?: boolean;
  duplicateSymbols?: Set<string>;
  assetClassCode?: string;
}

export default function EditableTable({
  rows,
  onChange,
  showAddRow,
  duplicateSymbols,
  assetClassCode = "EQUITY_IN",
}: EditableTableProps) {
  const columns = getColumns(assetClassCode);
  const numericFields = new Set(["quantity", "avg_buy_price", "interest_rate", "amount_invested"]);

  const updateRow = (index: number, field: string, value: string) => {
    const next = [...rows];
    if (numericFields.has(field)) {
      (next[index] as Record<string, unknown>)[field] = value === "" ? 0 : parseFloat(value) || 0;
    } else {
      (next[index] as Record<string, unknown>)[field] = value;
    }
    onChange(next);
  };

  const deleteRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const blank: ImportRow = {
      symbol: "",
      name: "",
      quantity: NO_QUANTITY_REQUIRED.has(assetClassCode) ? 1 : 0,
      avg_buy_price: 0,
      asset_class_code: assetClassCode,
      buy_currency: assetClassCode === "EQUITY_US" ? "USD" : "INR",
      ...(assetClassCode === "GOLD_SGB" ? { interest_rate: 2.5 } : {}),
    };
    onChange([...rows, blank]);
  };

  const totalValue = rows.reduce(
    (sum, r) => sum + (r.amount_invested || (r.quantity || 1) * r.avg_buy_price),
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
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.align === "right" ? "text-right" : "text-left"} py-3 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide`}
                >
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isDupe = row.symbol && duplicateSymbols?.has(row.symbol.toUpperCase());
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-100 dark:border-gray-800 ${isDupe ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}
                >
                  {columns.map((col) => {
                    const val = (row as Record<string, unknown>)[col.key];

                    if (col.type === "select" && col.options) {
                      return (
                        <td key={col.key} className="py-2 px-2">
                          <Select
                            id={`${col.key}-${i}`}
                            value={(val as string) || col.options[0]?.value || ""}
                            onChange={(e) => updateRow(i, col.key, e.target.value)}
                            options={col.options}
                          />
                        </td>
                      );
                    }

                    if (col.type === "number") {
                      return (
                        <td key={col.key} className="py-2 px-2">
                          <input
                            type="number"
                            value={(val as number) || ""}
                            onChange={(e) => updateRow(i, col.key, e.target.value)}
                            className={`${inputClass} ${col.width || "w-28"} text-right`}
                            placeholder={col.placeholder}
                            min="0"
                            step="any"
                          />
                        </td>
                      );
                    }

                    if (col.type === "date") {
                      return (
                        <td key={col.key} className="py-2 px-2">
                          <input
                            type="date"
                            value={(val as string) || ""}
                            onChange={(e) => updateRow(i, col.key, e.target.value)}
                            className={`${inputClass} w-36`}
                          />
                        </td>
                      );
                    }

                    // Text field — show dupe badge on the name column
                    const showDupe = col.key === "name" && isDupe;
                    return (
                      <td key={col.key} className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={(val as string) || ""}
                            onChange={(e) => updateRow(i, col.key, e.target.value)}
                            className={inputClass}
                            placeholder={col.placeholder}
                          />
                          {showDupe && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400">
                              Dupe
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
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

export { NO_SYMBOL_REQUIRED, NO_QUANTITY_REQUIRED, getColumns };
