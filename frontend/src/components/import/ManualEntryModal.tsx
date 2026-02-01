"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import StepIndicator from "./StepIndicator";
import EditableTable, { NO_SYMBOL_REQUIRED, NO_QUANTITY_REQUIRED } from "./EditableTable";
import ReviewTable from "./ReviewTable";
import ConflictResolutionStep from "./ConflictResolutionStep";
import SuccessState from "./SuccessState";
import MfResolveStep from "./MfResolveStep";
import { useImport } from "@/hooks/useImport";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import type { ImportRow, DuplicateMatch, ConflictAction, RowAction } from "@/types";

const STEPS_DEFAULT = ["Entry", "Confirm"];
const STEPS_DEFAULT_CONFLICT = ["Entry", "Conflicts", "Confirm"];
const STEPS_MF = ["Entry", "Resolve", "Confirm"];
const STEPS_MF_CONFLICT = ["Entry", "Resolve", "Conflicts", "Confirm"];

const ASSET_CLASS_OPTIONS = [
  { value: "EQUITY_IN", label: "Indian Equity" },
  { value: "MUTUAL_FUND", label: "Indian Mutual Fund" },
  { value: "GOLD_PHYSICAL", label: "Physical Gold" },
  { value: "GOLD_SGB", label: "Sovereign Gold Bond" },
  { value: "GOLD_ETF", label: "Gold ETF" },
  { value: "GOLD_DIGITAL", label: "Digital Gold" },
  { value: "FIXED_DEPOSIT", label: "Fixed Deposit" },
  { value: "PPF", label: "PPF" },
  { value: "EPF", label: "EPF" },
  { value: "NPS", label: "NPS" },
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "BOND", label: "Bond" },
];

// Asset classes where user enters total amount instead of per-unit price
const AMOUNT_INVESTED_CLASSES = new Set([
  "MUTUAL_FUND", "GOLD_PHYSICAL", "GOLD_DIGITAL", "GOLD_SGB",
]);

function makeBlankRow(assetClassCode: string): ImportRow {
  return {
    symbol: "",
    name: "",
    quantity: NO_QUANTITY_REQUIRED.has(assetClassCode) ? 1 : 0,
    avg_buy_price: 0,
    asset_class_code: assetClassCode,
    buy_currency: assetClassCode === "EQUITY_US" ? "USD" : "INR",
    ...(assetClassCode === "GOLD_SGB" ? { interest_rate: 2.5 } : {}),
  };
}

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
  const [step, setStep] = useState(0);
  const [defaultAssetClass, setDefaultAssetClass] = useState("EQUITY_IN");
  const [rows, setRows] = useState<ImportRow[]>([makeBlankRow("EQUITY_IN")]);
  const [resolvedRows, setResolvedRows] = useState<ImportRow[]>([]);
  const [done, setDone] = useState(false);
  const [importSummary, setImportSummary] = useState<{ created: number; merged: number; replaced: number; skipped: number } | undefined>();
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [conflictActions, setConflictActions] = useState<Record<number, ConflictAction>>({});
  const [hasConflicts, setHasConflicts] = useState(false);

  const { confirmImport, confirming, resolveMfNames, resolveIsin, resolving, checkDuplicates, checkingDuplicates } = useImport();

  const isMf = defaultAssetClass === "MUTUAL_FUND";
  const steps = isMf
    ? (hasConflicts ? STEPS_MF_CONFLICT : STEPS_MF)
    : (hasConflicts ? STEPS_DEFAULT_CONFLICT : STEPS_DEFAULT);

  // Dynamic step indices
  const resolveStep = isMf ? 1 : -1;
  const conflictStep = hasConflicts
    ? (isMf ? 2 : 1)
    : -1;
  const confirmStep = hasConflicts
    ? (isMf ? 3 : 2)
    : (isMf ? 2 : 1);

  const reset = () => {
    setStep(0);
    setRows([makeBlankRow("EQUITY_IN")]);
    setResolvedRows([]);
    setDefaultAssetClass("EQUITY_IN");
    setDone(false);
    setImportSummary(undefined);
    setDuplicates([]);
    setConflictActions({});
    setHasConflicts(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDefaultAssetClassChange = (value: string) => {
    setDefaultAssetClass(value);
    setRows([makeBlankRow(value)]);
    setResolvedRows([]);
    setDuplicates([]);
    setConflictActions({});
    setHasConflicts(false);
    setStep(0);
  };

  const isRowValid = (r: ImportRow) => {
    const needsSymbol = !NO_SYMBOL_REQUIRED.has(r.asset_class_code);
    const needsQty = !NO_QUANTITY_REQUIRED.has(r.asset_class_code);
    const usesAmount = AMOUNT_INVESTED_CLASSES.has(r.asset_class_code);

    if (needsSymbol && !r.symbol) return false;
    if (needsQty && r.quantity <= 0) return false;
    if (!needsSymbol && !r.name) return false;

    if (usesAmount) {
      if (!r.amount_invested || r.amount_invested <= 0) return false;
    } else {
      if (r.avg_buy_price <= 0) return false;
    }
    return true;
  };

  const handleReview = async () => {
    const validRows = rows.filter(isRowValid);
    if (validRows.length === 0) {
      const needsSymbol = !NO_SYMBOL_REQUIRED.has(defaultAssetClass);
      toast.error(
        needsSymbol
          ? "Add at least one holding with a symbol, quantity, and price"
          : "Add at least one holding with a name and value"
      );
      return;
    }

    if (isMf) {
      // Move to resolve step and trigger resolution
      setStep(1);
      const fundNames = validRows.map((r) => r.name);
      try {
        const results = await resolveMfNames(fundNames);
        const merged = validRows.map((row, i) => {
          const res = results[i];
          return {
            ...row,
            resolved_symbol: res?.resolved ? res.yf_ticker : undefined,
            resolved_isin: res?.isin || undefined,
            matched_name: res?.matched_name || undefined,
          };
        });
        setResolvedRows(merged);
      } catch {
        toast.error("Failed to resolve fund names");
        setResolvedRows(validRows.map((r) => ({ ...r })));
      }
    } else {
      // Non-MF: check duplicates, then go to conflict or confirm
      const found = await runDuplicateCheck(validRows);
      setStep(found ? 1 : 1); // step 1 = conflicts if found, else confirm
    }
  };

  const handleResolveRowUpdate = (index: number, updates: Partial<ImportRow>) => {
    setResolvedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const allResolved = resolvedRows.length > 0 && resolvedRows.every((r) => r.resolved_symbol);

  const runDuplicateCheck = async (rowsToCheck: ImportRow[]) => {
    try {
      const result = await checkDuplicates(rowsToCheck);
      if (result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
        const defaultActions: Record<number, ConflictAction> = {};
        for (const dup of result.duplicates) {
          defaultActions[dup.row_index] = "merge";
        }
        setConflictActions(defaultActions);
        setHasConflicts(true);
        return true;
      }
      setHasConflicts(false);
      return false;
    } catch {
      toast.error("Failed to check for duplicates");
      setHasConflicts(false);
      return false;
    }
  };

  const handleContinueFromResolve = async () => {
    const found = await runDuplicateCheck(resolvedRows);
    // Step after resolve: conflict step (2) if conflicts found, else confirm step (2 without conflicts)
    setStep(found ? 2 : 2);
  };

  const handleBackFromResolve = () => {
    setStep(0);
    setResolvedRows([]);
    setDuplicates([]);
    setConflictActions({});
    setHasConflicts(false);
  };

  const handleConfirm = async () => {
    let rowsToImport: ImportRow[];

    if (isMf) {
      // Copy resolved_symbol → symbol and clean up resolution fields
      rowsToImport = resolvedRows.map((r) => ({
        ...r,
        symbol: r.resolved_symbol || r.symbol,
        resolved_symbol: undefined,
        resolved_isin: undefined,
        matched_name: undefined,
      }));
    } else {
      rowsToImport = rows.filter(isRowValid);
    }

    // Derive avg_buy_price from amount_invested for applicable asset classes
    const processedRows = rowsToImport.map((r) => {
      if (AMOUNT_INVESTED_CLASSES.has(r.asset_class_code) && r.amount_invested && r.quantity > 0) {
        return {
          ...r,
          avg_buy_price: r.amount_invested / r.quantity,
        };
      }
      return r;
    });

    try {
      // Build actions array if there are conflicts
      let actions: RowAction[] | undefined;
      if (duplicates.length > 0) {
        const dupMap = new Map(duplicates.map((d) => [d.row_index, d]));
        actions = processedRows.map((_, i) => {
          const dup = dupMap.get(i);
          if (dup) {
            const conflictAction = conflictActions[i] || "merge";
            return {
              action: conflictAction,
              existing_holding_id: dup.existing.id,
            };
          }
          return { action: "create" as const };
        });
      }

      await confirmImport(processedRows, "manual", actions);

      if (conflictSummary) {
        setImportSummary(conflictSummary);
        if (conflictSummary.skipped === processedRows.length) {
          toast.success("All holdings skipped — no changes made");
        } else {
          const parts: string[] = [];
          if (conflictSummary.created > 0) parts.push(`${conflictSummary.created} added`);
          if (conflictSummary.merged > 0) parts.push(`${conflictSummary.merged} merged`);
          if (conflictSummary.replaced > 0) parts.push(`${conflictSummary.replaced} replaced`);
          if (conflictSummary.skipped > 0) parts.push(`${conflictSummary.skipped} skipped`);
          toast.success(parts.join(", "));
        }
      } else {
        toast.success("Import complete!");
      }
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Import failed");
    }
  };

  const validCount = rows.filter(isRowValid).length;
  const confirmRows = isMf ? resolvedRows : rows.filter(isRowValid);

  // Conflict action breakdown
  const conflictSummary = hasConflicts && duplicates.length > 0 ? (() => {
    const dupIndices = new Set(duplicates.map((d) => d.row_index));
    let created = 0, merged = 0, replaced = 0, skipped = 0;
    for (let i = 0; i < confirmRows.length; i++) {
      if (dupIndices.has(i)) {
        const action = conflictActions[i] || "merge";
        if (action === "skip") skipped++;
        else if (action === "merge") merged++;
        else if (action === "replace") replaced++;
      } else {
        created++;
      }
    }
    return { created, merged, replaced, skipped };
  })() : null;

  const skippedIndices = hasConflicts && duplicates.length > 0 ? (() => {
    const set = new Set<number>();
    for (const dup of duplicates) {
      if (conflictActions[dup.row_index] === "skip") set.add(dup.row_index);
    }
    return set.size > 0 ? set : undefined;
  })() : undefined;

  const effectiveCount = conflictSummary
    ? conflictSummary.created + conflictSummary.merged + conflictSummary.replaced
    : confirmRows.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Entry"
      className="max-w-5xl max-h-[85vh] overflow-y-auto"
    >
      {done ? (
        <SuccessState count={effectiveCount} onClose={handleClose} summary={importSummary} />
      ) : (
        <>
          <StepIndicator steps={steps} current={step} />

          {/* Step 0: Entry */}
          {step === 0 && (
            <div>
              <div className="mb-5 max-w-xs">
                <Select
                  id="default-asset-class"
                  label="Asset Class"
                  value={defaultAssetClass}
                  onChange={(e) =>
                    handleDefaultAssetClassChange(e.target.value)
                  }
                  options={ASSET_CLASS_OPTIONS}
                />
              </div>

              <EditableTable
                rows={rows}
                onChange={setRows}
                showAddRow
                assetClassCode={defaultAssetClass}
              />

              <div className="flex justify-end mt-6">
                <Button size="lg" onClick={handleReview} disabled={validCount === 0}>
                  Review ({validCount})
                </Button>
              </div>
            </div>
          )}

          {/* Step 1 (MF only): Resolve */}
          {step === resolveStep && (
            <div>
              {resolving || resolvedRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-lime" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resolving fund names to market tickers...
                  </p>
                </div>
              ) : (
                <MfResolveStep
                  rows={resolvedRows}
                  onUpdateRow={handleResolveRowUpdate}
                  resolveIsin={resolveIsin}
                />
              )}
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={handleBackFromResolve}>
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleContinueFromResolve}
                  disabled={!allResolved || resolving}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Conflict resolution step */}
          {step === conflictStep && hasConflicts && (
            <div>
              {checkingDuplicates ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-lime" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Checking for existing holdings...
                  </p>
                </div>
              ) : (
                <ConflictResolutionStep
                  duplicates={duplicates}
                  actions={conflictActions}
                  onActionChange={(idx, action) =>
                    setConflictActions((prev) => ({ ...prev, [idx]: action }))
                  }
                  onApplyAll={(action) => {
                    const updated: Record<number, ConflictAction> = {};
                    for (const dup of duplicates) {
                      updated[dup.row_index] = action;
                    }
                    setConflictActions(updated);
                  }}
                />
              )}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(isMf ? 1 : 0)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={() => setStep(confirmStep)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Confirm step */}
          {step === confirmStep && (
            <div>
              <ReviewTable
                rows={confirmRows}
                assetClassCode={defaultAssetClass}
                skippedIndices={skippedIndices}
              />
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(hasConflicts ? conflictStep : (isMf ? 1 : 0))}
                >
                  Back
                </Button>
                <Button size="lg" onClick={handleConfirm} loading={confirming}>
                  {conflictSummary
                    ? conflictSummary.skipped === confirmRows.length
                      ? "Confirm — All Skipped"
                      : `Confirm Import (${effectiveCount} holdings)`
                    : `Import ${confirmRows.length} Holdings`
                  }
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
