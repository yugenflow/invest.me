"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { GitMerge, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { DuplicateGroup } from "@/types";

interface DuplicateCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: DuplicateGroup[][];
  onMerged: () => void;
}

function computeMerge(holdings: DuplicateGroup[]): { qty: number; price: number } {
  let totalQty = 0;
  let totalValue = 0;
  for (const h of holdings) {
    totalQty += h.quantity;
    totalValue += h.quantity * h.avg_buy_price;
  }
  return {
    qty: totalQty,
    price: totalQty > 0 ? totalValue / totalQty : 0,
  };
}

export default function DuplicateCleanupModal({
  isOpen,
  onClose,
  groups,
  onMerged,
}: DuplicateCleanupModalProps) {
  const [merging, setMerging] = useState(false);
  const [mergingGroup, setMergingGroup] = useState<number | null>(null);

  const handleMergeGroup = async (groupIndex: number) => {
    const group = groups[groupIndex];
    const ids = group.map((h) => h.id);
    setMergingGroup(groupIndex);
    try {
      await api.post("/holdings/merge-duplicates", { group_keys: [ids] });
      toast.success("Holdings merged");
      onMerged();
    } catch {
      toast.error("Failed to merge holdings");
    } finally {
      setMergingGroup(null);
    }
  };

  const handleMergeAll = async () => {
    const allKeys = groups.map((group) => group.map((h) => h.id));
    setMerging(true);
    try {
      await api.post("/holdings/merge-duplicates", { group_keys: allKeys });
      toast.success(`${groups.length} group${groups.length !== 1 ? "s" : ""} merged`);
      onMerged();
      onClose();
    } catch {
      toast.error("Failed to merge holdings");
    } finally {
      setMerging(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Holdings"
      className="max-w-2xl max-h-[80vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-card border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {groups.length} group{groups.length !== 1 ? "s" : ""} of duplicate holdings found
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              Merging combines quantities and calculates a weighted average price. The oldest holding is kept.
            </p>
          </div>
        </div>

        {groups.map((group, gi) => {
          const merged = computeMerge(group);
          const currency = group[0]?.buy_currency || "INR";
          const displayName = group[0]?.symbol || group[0]?.name;

          return (
            <div
              key={gi}
              className="rounded-card border border-gray-200 dark:border-navy-700 overflow-hidden"
            >
              {/* Group header */}
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-navy-900 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {displayName}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                    {group[0]?.asset_class_code} &middot; {group.length} duplicates
                  </span>
                </span>
                <Button
                  size="sm"
                  onClick={() => handleMergeGroup(gi)}
                  loading={mergingGroup === gi}
                  disabled={merging}
                >
                  <GitMerge className="w-3.5 h-3.5 mr-1" />
                  Merge
                </Button>
              </div>

              {/* Holdings in this group */}
              <div className="divide-y divide-gray-100 dark:divide-navy-700">
                {group.map((h, hi) => (
                  <div key={h.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{h.name}</p>
                      {h.symbol && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{h.symbol}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-600 dark:text-gray-300">
                      <p>{h.quantity} units @ {formatCurrency(h.avg_buy_price, currency)}</p>
                      <p className="font-semibold">{formatCurrency(h.quantity * h.avg_buy_price, currency)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Merged result preview */}
              <div className="px-4 py-2.5 bg-brand-lime/5 border-t border-brand-lime/20 flex items-center justify-between">
                <span className="text-xs font-medium text-brand-lime">Merged result</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {merged.qty} units @ {formatCurrency(merged.price, currency)} = {formatCurrency(merged.qty * merged.price, currency)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Merge All button */}
        {groups.length > 1 && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleMergeAll} loading={merging}>
              <GitMerge className="w-4 h-4 mr-2" />
              Merge All ({groups.length} groups)
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
