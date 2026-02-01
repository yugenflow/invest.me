"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import type { ImportRow } from "@/types";

interface MfResolveStepProps {
  rows: ImportRow[];
  onUpdateRow: (index: number, updates: Partial<ImportRow>) => void;
  resolveIsin: (isin: string) => Promise<{ resolved: boolean; yf_ticker?: string }>;
}

export default function MfResolveStep({ rows, onUpdateRow, resolveIsin }: MfResolveStepProps) {
  const [isinInputs, setIsinInputs] = useState<Record<number, string>>({});
  const [resolvingIndex, setResolvingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const resolvedCount = rows.filter((r) => r.resolved_symbol).length;

  const handleResolveIsin = async (index: number) => {
    const isin = isinInputs[index]?.trim();
    if (!isin) return;

    setResolvingIndex(index);
    setErrors((prev) => ({ ...prev, [index]: "" }));

    try {
      const result = await resolveIsin(isin);
      if (result.resolved && result.yf_ticker) {
        onUpdateRow(index, {
          resolved_symbol: result.yf_ticker,
          resolved_isin: isin.toUpperCase(),
        });
      } else {
        setErrors((prev) => ({ ...prev, [index]: "Could not resolve this ISIN" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [index]: "Resolution failed — check ISIN and try again" }));
    } finally {
      setResolvingIndex(null);
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-gray-200 dark:border-navy-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-navy-800/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-10">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Fund Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Ticker</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const resolved = !!row.resolved_symbol;
              return (
                <tr
                  key={i}
                  className={
                    resolved
                      ? "bg-green-50/60 dark:bg-green-900/10"
                      : "bg-amber-50/60 dark:bg-amber-900/10"
                  }
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
                    {resolved && row.matched_name && row.matched_name !== row.name && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Matched: {row.matched_name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {resolved ? (
                      <span className="inline-flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Resolved
                      </span>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Not found
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter ISIN (e.g. INF200K...)"
                            value={isinInputs[i] || ""}
                            onChange={(e) =>
                              setIsinInputs((prev) => ({ ...prev, [i]: e.target.value }))
                            }
                            className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white w-48 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveIsin(i)}
                            loading={resolvingIndex === i}
                            disabled={!isinInputs[i]?.trim() || resolvingIndex === i}
                          >
                            Resolve
                          </Button>
                        </div>
                        {errors[i] && (
                          <p className="text-xs text-red-500 mt-1">{errors[i]}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                    {row.resolved_symbol || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {resolvedCount} of {rows.length} fund{rows.length !== 1 ? "s" : ""} resolved
      </div>
    </div>
  );
}
