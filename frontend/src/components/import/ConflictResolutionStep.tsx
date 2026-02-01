"use client";

import { useState } from "react";
import { AlertTriangle, GitMerge, SkipForward, Replace } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DuplicateMatch, ConflictAction } from "@/types";

interface ConflictResolutionStepProps {
  duplicates: DuplicateMatch[];
  actions: Record<number, ConflictAction>;
  onActionChange: (rowIndex: number, action: ConflictAction) => void;
  onApplyAll: (action: ConflictAction) => void;
}

const ACTION_OPTIONS: { value: ConflictAction; label: string; icon: typeof GitMerge; desc: string }[] = [
  { value: "merge", label: "Merge", icon: GitMerge, desc: "Combine quantities, weighted avg price" },
  { value: "skip", label: "Skip", icon: SkipForward, desc: "Keep existing, ignore incoming" },
  { value: "replace", label: "Replace", icon: Replace, desc: "Overwrite existing with incoming" },
];

export default function ConflictResolutionStep({
  duplicates,
  actions,
  onActionChange,
  onApplyAll,
}: ConflictResolutionStepProps) {
  const [showApplyAll, setShowApplyAll] = useState(false);

  const resolvedCount = Object.keys(actions).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-card border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {duplicates.length} holding{duplicates.length !== 1 ? "s" : ""} already exist{duplicates.length === 1 ? "s" : ""} in your portfolio
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
            Choose how to handle each conflict. {resolvedCount} of {duplicates.length} resolved.
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowApplyAll(!showApplyAll)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
          >
            Apply to all
          </button>
          {showApplyAll && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-lg shadow-lg py-1 min-w-[160px]">
              {ACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onApplyAll(opt.value);
                    setShowApplyAll(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-navy-700 flex items-center gap-2"
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conflict cards */}
      {duplicates.map((dup) => {
        const selected = actions[dup.row_index] || "merge";
        const currency = dup.existing.buy_currency || "INR";
        const existingValue = dup.existing.quantity * dup.existing.avg_buy_price;
        const incomingValue = dup.incoming_quantity * dup.incoming_avg_price;
        const mergedValue = dup.merged_quantity * dup.merged_avg_price;

        return (
          <div
            key={dup.row_index}
            className="rounded-card border border-gray-200 dark:border-navy-700 overflow-hidden"
          >
            {/* Title bar */}
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-navy-900 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {dup.incoming_symbol || dup.incoming_name}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {dup.existing.asset_class_code}
                </span>
              </span>
            </div>

            {/* Comparison grid */}
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-navy-700">
              {/* Existing */}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Existing
                </p>
                <p className="text-sm font-medium truncate">{dup.existing.name}</p>
                {dup.existing.symbol && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dup.existing.symbol}</p>
                )}
                <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Qty</span>
                    <span className="font-medium">{dup.existing.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Price</span>
                    <span className="font-medium">{formatCurrency(dup.existing.avg_buy_price, currency)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-navy-700">
                    <span>Value</span>
                    <span className="font-semibold">{formatCurrency(existingValue, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Incoming */}
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-lime mb-2">
                  Incoming
                </p>
                <p className="text-sm font-medium truncate">{dup.incoming_name || dup.incoming_symbol}</p>
                {dup.incoming_symbol && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dup.incoming_symbol}</p>
                )}
                <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Qty</span>
                    <span className="font-medium">{dup.incoming_quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Price</span>
                    <span className="font-medium">{formatCurrency(dup.incoming_avg_price, currency)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-navy-700">
                    <span>Value</span>
                    <span className="font-semibold">{formatCurrency(incomingValue, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Merge preview */}
            {selected === "merge" && (
              <div className="px-4 py-2.5 bg-brand-lime/5 border-t border-brand-lime/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-brand-lime">Merged result</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {dup.merged_quantity} units @ {formatCurrency(dup.merged_avg_price, currency)} = {formatCurrency(mergedValue, currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Action selector */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-navy-700 flex gap-2">
              {ACTION_OPTIONS.map((opt) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onActionChange(dup.row_index, opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? opt.value === "merge"
                          ? "bg-brand-lime text-brand-black"
                          : opt.value === "skip"
                            ? "bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                        : "bg-gray-50 dark:bg-navy-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700"
                    }`}
                    title={opt.desc}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
