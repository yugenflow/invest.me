"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, ChevronUp, ChevronDown, Search, X } from "lucide-react";
import type { Holding } from "@/types";

// Mirrors backend ASSET_CLASS_NAMES + CATEGORY_COLORS from portfolio_service.py
const ASSET_CLASS_META: Record<string, { label: string; color: string }> = {
  EQUITY_IN:      { label: "Indian Equity",       color: "#3B82F6" },
  EQUITY_US:      { label: "US Equity",            color: "#3B82F6" },
  MUTUAL_FUND:    { label: "Mutual Fund",          color: "#8B5CF6" },
  MF:             { label: "Mutual Fund",          color: "#8B5CF6" },
  CRYPTO:         { label: "Cryptocurrency",       color: "#F59E0B" },
  GOLD_PHYSICAL:  { label: "Physical Gold",        color: "#EAB308" },
  GOLD_SGB:       { label: "Sovereign Gold Bond",  color: "#EAB308" },
  GOLD_ETF:       { label: "Gold ETF",             color: "#EAB308" },
  GOLD_DIGITAL:   { label: "Digital Gold",         color: "#EAB308" },
  GOLD:           { label: "Gold",                 color: "#EAB308" },
  FIXED_DEPOSIT:  { label: "Fixed Deposit",        color: "#10B981" },
  FD:             { label: "Fixed Deposit",        color: "#10B981" },
  PPF:            { label: "PPF",                  color: "#10B981" },
  EPF:            { label: "EPF",                  color: "#10B981" },
  NPS:            { label: "NPS",                  color: "#10B981" },
  BOND:           { label: "Bond",                 color: "#10B981" },
  REAL_ESTATE:    { label: "Real Estate",          color: "#F97316" },
  OTHER:          { label: "Other",                color: "#6B7280" },
};

function getAssetMeta(code: string) {
  return ASSET_CLASS_META[code] || { label: formatAssetCode(code), color: "#6B7280" };
}

function formatAssetCode(code: string) {
  return code
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

type SortField = "balance" | "dailyPL" | "gainLoss" | "netWorthPct";
type SortDir = "asc" | "desc";

interface HoldingsTableProps {
  holdings: Holding[];
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
  selectMode: boolean;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export default function HoldingsTable({
  holdings,
  onEdit,
  onDelete,
  selectMode,
  selectedIds,
  onSelectionChange,
}: HoldingsTableProps) {
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  // Compute total portfolio value for % of net worth
  const totalPortfolioValue = useMemo(
    () => holdings.reduce((sum, h) => sum + (h.current_value ?? h.quantity * h.avg_buy_price), 0),
    [holdings],
  );

  const uniqueClasses = useMemo(
    () => Array.from(new Set(holdings.map((h) => h.asset_class_code))),
    [holdings],
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let list = holdings;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.symbol && h.symbol.toLowerCase().includes(q)),
      );
    }
    if (filterClass !== "ALL") {
      list = list.filter((h) => h.asset_class_code === filterClass);
    }
    if (sortField) {
      list = [...list].sort((a, b) => {
        let va = 0;
        let vb = 0;
        if (sortField === "balance") {
          va = a.current_value ?? a.quantity * a.avg_buy_price;
          vb = b.current_value ?? b.quantity * b.avg_buy_price;
        } else if (sortField === "dailyPL") {
          const aPrice = a.current_value ? a.current_value / (a.quantity || 1) : a.avg_buy_price;
          const bPrice = b.current_value ? b.current_value / (b.quantity || 1) : b.avg_buy_price;
          const aDayPct = a.day_change_pct ?? 0;
          const bDayPct = b.day_change_pct ?? 0;
          va = a.quantity * aPrice * (aDayPct / 100);
          vb = b.quantity * bPrice * (bDayPct / 100);
        } else if (sortField === "gainLoss") {
          va = a.gain_loss ?? 0;
          vb = b.gain_loss ?? 0;
        } else if (sortField === "netWorthPct") {
          va = a.current_value ?? a.quantity * a.avg_buy_price;
          vb = b.current_value ?? b.quantity * b.avg_buy_price;
        }
        return sortDir === "desc" ? vb - va : va - vb;
      });
    }
    return list;
  }, [holdings, search, filterClass, sortField, sortDir]);

  const filteredIds = useMemo(() => new Set(filtered.map((h) => h.id)), [filtered]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((h) => selectedIds.has(h.id));

  const someFilteredSelected =
    !allFilteredSelected && filtered.some((h) => selectedIds.has(h.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all currently filtered
      const next = new Set(selectedIds);
      for (const h of filtered) next.delete(h.id);
      onSelectionChange(next);
    } else {
      // Select all currently filtered
      const next = new Set(selectedIds);
      for (const h of filtered) next.add(h.id);
      onSelectionChange(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-base">
        No holdings yet. Add your first investment above.
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 opacity-30" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3.5 h-3.5" />
      : <ChevronUp className="w-3.5 h-3.5" />;
  };

  return (
    <div className="overflow-x-auto">
      {/* Search bar */}
      <div className="px-4 mb-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search holdings..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-lime focus:border-brand-lime placeholder:text-gray-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Legend + Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 px-4">
        <button
          onClick={() => setFilterClass("ALL")}
          className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
            filterClass === "ALL"
              ? "bg-brand-lime text-brand-black"
              : "bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
          }`}
        >
          All
        </button>
        {uniqueClasses.map((code) => {
          const meta = getAssetMeta(code);
          const isActive = filterClass === code;
          return (
            <button
              key={code}
              onClick={() => setFilterClass(isActive ? "ALL" : code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                isActive
                  ? "bg-brand-lime text-brand-black"
                  : "bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          No holdings match{search ? ` "${search}"` : " this filter"}.
        </div>
      )}

      {filtered.length > 0 && <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-navy-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
            {selectMode && (
              <th className="py-4 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someFilteredSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-lime focus:ring-brand-lime cursor-pointer accent-[#D4F358]"
                />
              </th>
            )}
            <th className="py-4 px-4 font-semibold">Asset</th>
            <th className="py-4 px-4 font-semibold">Price</th>
            <th
              className="py-4 px-4 font-semibold cursor-pointer select-none hover:text-brand-black dark:hover:text-white transition-colors"
              onClick={() => toggleSort("balance")}
            >
              <span className="inline-flex items-center gap-1">
                Balance <SortIcon field="balance" />
              </span>
            </th>
            <th
              className="py-4 px-4 font-semibold cursor-pointer select-none hover:text-brand-black dark:hover:text-white transition-colors"
              onClick={() => toggleSort("dailyPL")}
            >
              <span className="inline-flex items-center gap-1">
                Daily P/L <SortIcon field="dailyPL" />
              </span>
            </th>
            <th
              className="py-4 px-4 font-semibold cursor-pointer select-none hover:text-brand-black dark:hover:text-white transition-colors"
              onClick={() => toggleSort("gainLoss")}
            >
              <span className="inline-flex items-center gap-1">
                Net P/L <SortIcon field="gainLoss" />
              </span>
            </th>
            <th
              className="py-4 px-4 font-semibold cursor-pointer select-none hover:text-brand-black dark:hover:text-white transition-colors"
              onClick={() => toggleSort("netWorthPct")}
            >
              <span className="inline-flex items-center gap-1">
                % Net Worth <SortIcon field="netWorthPct" />
              </span>
            </th>
            <th className="py-4 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
          {filtered.map((h) => {
            const value = h.current_value ?? h.quantity * h.avg_buy_price;
            const gainLoss = h.gain_loss ?? 0;
            const gainLossPct = h.gain_loss_pct ?? 0;
            const isPositive = gainLoss >= 0;
            const dayChangePct = h.day_change_pct ?? 0;
            const currentPrice = h.current_value ? h.current_value / (h.quantity || 1) : h.avg_buy_price;
            const dailyPL = h.quantity * currentPrice * (dayChangePct / 100);
            const isDayPositive = dailyPL >= 0;
            const meta = getAssetMeta(h.asset_class_code);
            const netWorthPct = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;
            const isSelected = selectedIds.has(h.id);

            return (
              <tr
                key={h.id}
                className={`transition-colors ${
                  isSelected
                    ? "bg-brand-lime/5 dark:bg-brand-lime/5"
                    : "hover:bg-gray-50 dark:hover:bg-navy-700/50"
                }`}
              >
                {selectMode && (
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(h.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-lime focus:ring-brand-lime cursor-pointer accent-[#D4F358]"
                    />
                  </td>
                )}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                      title={meta.label}
                    />
                    <div>
                      <div className="font-bold text-[15px]">{h.name}</div>
                      {h.symbol && <div className="text-sm text-gray-400 font-medium">{h.symbol}</div>}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-[15px] font-medium">
                  {formatCurrency(
                    h.current_value ? h.current_value / (h.quantity || 1) : h.avg_buy_price,
                    h.buy_currency
                  )}
                </td>
                <td className="py-4 px-4 text-[15px] font-medium">
                  {formatCurrency(value, h.buy_currency)}
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[15px] font-bold ${isDayPositive ? "text-gain" : "text-alert-red"}`}>
                    {isDayPositive ? "+" : ""}{formatCurrency(dailyPL, h.buy_currency)}
                  </span>
                  <div className={`text-sm font-medium ${isDayPositive ? "text-gain" : "text-alert-red"}`}>
                    {isDayPositive ? "+" : ""}{dayChangePct.toFixed(2)}%
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[15px] font-bold ${isPositive ? "text-gain" : "text-alert-red"}`}>
                    {isPositive ? "+" : ""}{formatCurrency(gainLoss, h.buy_currency)}
                  </span>
                  <div className={`text-sm font-medium ${isPositive ? "text-gain" : "text-alert-red"}`}>
                    {isPositive ? "+" : ""}{gainLossPct.toFixed(2)}%
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(netWorthPct, 100)}%`, backgroundColor: meta.color }}
                      />
                    </div>
                    <span className="text-[15px] font-semibold tabular-nums">
                      {netWorthPct.toFixed(1)}%
                    </span>
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
      </table>}
    </div>
  );
}
