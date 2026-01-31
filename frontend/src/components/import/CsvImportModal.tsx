"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import StepIndicator from "./StepIndicator";
import DropZone from "./DropZone";
import ColumnMapper from "./ColumnMapper";
import EditableTable from "./EditableTable";
import ReviewTable from "./ReviewTable";
import SuccessState from "./SuccessState";
import { useImport } from "@/hooks/useImport";
import toast from "react-hot-toast";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ImportRow, ColumnMapping, FileGroup } from "@/types";

const STEPS = ["Upload", "Review", "Confirm"];

const BROKER_OPTIONS = [
  { value: "", label: "Auto-detect (recommended)" },
  { value: "kotak", label: "Kotak Neo" },
  { value: "upstox", label: "Upstox" },
  { value: "zerodha", label: "Zerodha" },
];

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [broker, setBroker] = useState("");
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());
  const [showMapper, setShowMapper] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [done, setDone] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const [formatTab, setFormatTab] = useState<"equity" | "crypto">("equity");
  const [parseError, setParseError] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const { uploadCsv, uploadMultipleCsv, confirmImport, uploading, confirming } = useImport();

  // Compute duplicate symbols across non-excluded file groups
  const duplicateSymbols = useMemo(() => {
    const symbolFileCount = new Map<string, number>();
    for (const group of fileGroups) {
      if (group.excluded) continue;
      const seen = new Set<string>();
      for (const row of group.rows) {
        const sym = row.symbol?.toUpperCase();
        if (sym && !seen.has(sym)) {
          seen.add(sym);
          symbolFileCount.set(sym, (symbolFileCount.get(sym) || 0) + 1);
        }
      }
    }
    const dupes = new Set<string>();
    for (const [sym, count] of symbolFileCount) {
      if (count > 1) dupes.add(sym);
    }
    return dupes;
  }, [fileGroups]);

  const duplicateList = useMemo(() => Array.from(duplicateSymbols).sort(), [duplicateSymbols]);

  const activeGroups = useMemo(
    () => fileGroups.filter((g) => !g.excluded),
    [fileGroups],
  );

  const allRows = useMemo(
    () => activeGroups.flatMap((g) => g.rows),
    [activeGroups],
  );

  const reset = () => {
    setStep(0);
    setFiles([]);
    setBroker("");
    setFileGroups([]);
    setExpandedFiles(new Set());
    setShowMapper(false);
    setCsvHeaders([]);
    setColumnMapping({});
    setDone(false);
    setShowFormatHelp(false);
    setFormatTab("equity");
    setParseError(false);
    setImportedCount(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleFileExpand = (index: number) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleFileExclude = (index: number) => {
    setFileGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, excluded: !g.excluded } : g)),
    );
  };

  const updateGroupRows = (index: number, rows: ImportRow[]) => {
    setFileGroups((prev) =>
      prev.map((g, i) => (i === index ? { ...g, rows } : g)),
    );
  };

  const handleUpload = async (mapping?: ColumnMapping) => {
    if (files.length === 0) return;

    try {
      setParseError(false);

      // Single file — use original flow (supports column mapper fallback)
      if (files.length === 1) {
        const result = await uploadCsv(files[0], mapping, broker || undefined);

        if (result.rows.length > 0) {
          const group: FileGroup = {
            fileName: files[0].name,
            broker: result.detected_broker,
            rows: result.rows,
            excluded: false,
          };
          setFileGroups([group]);
          setExpandedFiles(new Set([0]));
          setShowMapper(false);
          setStep(1);
          const brokerLabel = result.detected_broker
            ? ` (${result.detected_broker})`
            : "";
          toast.success(`${result.count} holdings found${brokerLabel}`);
        } else if (result.headers && result.headers.length > 0) {
          setCsvHeaders(result.headers);
          setShowMapper(true);
        } else {
          setParseError(true);
          toast.error("Could not recognize the file format");
        }
        return;
      }

      // Multiple files — parallel upload
      const groups = await uploadMultipleCsv(files, mapping, broker || undefined);
      setFileGroups(groups);

      const successCount = groups.filter((g) => g.rows.length > 0).length;
      const totalRows = groups.reduce((sum, g) => sum + g.rows.length, 0);

      if (totalRows === 0) {
        setParseError(true);
        toast.error("No holdings found in any file");
        return;
      }

      // Expand all successful groups by default
      const expanded = new Set<number>();
      groups.forEach((g, i) => {
        if (g.rows.length > 0) expanded.add(i);
      });
      setExpandedFiles(expanded);
      setStep(1);

      const failCount = groups.length - successCount;
      if (failCount > 0) {
        toast.success(
          `${totalRows} holdings from ${successCount} file${successCount !== 1 ? "s" : ""}. ${failCount} file${failCount !== 1 ? "s" : ""} had errors.`,
        );
      } else {
        toast.success(
          `${totalRows} holdings found across ${successCount} file${successCount !== 1 ? "s" : ""}`,
        );
      }
    } catch (err: any) {
      setParseError(true);
      toast.error(err.response?.data?.detail || "Upload failed");
    }
  };

  const handleMapperSubmit = () => {
    handleUpload(columnMapping);
  };

  const handleConfirm = async () => {
    const validRows = allRows.filter((r) => r.symbol && r.quantity > 0);
    if (validRows.length === 0) {
      toast.error("No valid holdings to import");
      return;
    }
    try {
      // Use broker from the first active group, or fallback
      const primaryBroker =
        activeGroups.find((g) => g.broker)?.broker || broker || "csv";
      await confirmImport(validRows, primaryBroker);
      setImportedCount(validRows.length);
      setDone(true);
      toast.success("Import complete!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Import failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import from CSV"
      className="max-w-4xl max-h-[85vh] overflow-y-auto"
    >
      {done ? (
        <SuccessState count={importedCount} onClose={handleClose} />
      ) : (
        <>
          <StepIndicator steps={STEPS} current={step} />

          {step === 0 && (
            <div className="space-y-5">
              <div className="max-w-xs">
                <Select
                  id="broker-select"
                  label="Broker"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  options={BROKER_OPTIONS}
                />
              </div>

              <DropZone files={files} onFiles={setFiles} />

              <button
                type="button"
                onClick={() => setShowFormatHelp(!showFormatHelp)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                What format do we support?
                {showFormatHelp ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showFormatHelp && (
                <div className="rounded-card border border-gray-200 dark:border-gray-700 p-5">
                  {/* Asset class toggle */}
                  <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-navy-900 p-0.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setFormatTab("equity")}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        formatTab === "equity"
                          ? "bg-brand-lime text-brand-black"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      Indian Equity
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatTab("crypto")}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        formatTab === "crypto"
                          ? "bg-brand-lime text-brand-black"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      Crypto
                    </button>
                  </div>

                  {formatTab === "equity" ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Your CSV needs at least these <strong>3 columns</strong>. The column names can vary &mdash; we&apos;ll auto-detect them.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 font-semibold">Column</th>
                              <th className="text-left py-2 px-3 font-semibold">What it is</th>
                              <th className="text-left py-2 px-3 font-semibold">Example names we recognize</th>
                              <th className="text-center py-2 px-3 font-semibold">Required</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 dark:text-gray-300">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 px-3 font-medium">Symbol / Name</td>
                              <td className="py-2 px-3">Stock ticker or company name</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Symbol</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Name</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Instrument</code></td>
                              <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 px-3 font-medium">Quantity</td>
                              <td className="py-2 px-3">Number of shares held</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Qty</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Net Qty</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Quantity</code></td>
                              <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 px-3 font-medium">Avg Price</td>
                              <td className="py-2 px-3">Average buy price per share</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Avg. Price</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Avg. cost</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Average Price</code></td>
                              <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">Category</td>
                              <td className="py-2 px-3">Segment or exchange</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Category</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Segment</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Exchange</code></td>
                              <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                        We auto-detect exports from <strong>Zerodha</strong>, <strong>Upstox</strong>, <strong>Kotak Neo</strong>, and most standard broker formats.
                        LTP, current value, P&amp;L, and other columns are ignored &mdash; we derive them from live market data. Summary rows and blank lines are skipped automatically.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        For crypto holdings, your CSV should have these columns. We&apos;ll support exports from major exchanges soon.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 font-semibold">Column</th>
                              <th className="text-left py-2 px-3 font-semibold">What it is</th>
                              <th className="text-left py-2 px-3 font-semibold">Example names</th>
                              <th className="text-center py-2 px-3 font-semibold">Required</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 dark:text-gray-300">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 px-3 font-medium">Coin / Token</td>
                              <td className="py-2 px-3">Cryptocurrency symbol or name</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Coin</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Token</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Asset</code></td>
                              <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 px-3 font-medium">Quantity</td>
                              <td className="py-2 px-3">Amount of tokens held</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Amount</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Quantity</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Balance</code></td>
                              <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 px-3 font-medium">Avg Buy Price</td>
                              <td className="py-2 px-3">Average purchase price per token</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Avg Price</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Buy Price</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Cost Basis</code></td>
                              <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">Currency</td>
                              <td className="py-2 px-3">Trading pair currency</td>
                              <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Currency</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Quote</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Pair</code></td>
                              <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 rounded-lg bg-brand-lime/10 border border-brand-lime/20 px-4 py-3">
                        <p className="text-xs text-brand-lime font-medium">
                          Crypto import support is coming soon. We&apos;re working on auto-detection for CoinDCX, Binance, WazirX, and other major exchanges.
                          For now, you can use Manual Entry to add your crypto holdings.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {showMapper && csvHeaders.length > 0 && (
                <ColumnMapper
                  headers={csvHeaders}
                  mapping={columnMapping}
                  onChange={setColumnMapping}
                  onSubmit={handleMapperSubmit}
                  loading={uploading}
                />
              )}

              {files.length > 0 && !showMapper && (
                <Button size="lg" onClick={() => handleUpload()} loading={uploading}>
                  Upload & Parse {files.length > 1 ? `${files.length} Files` : ""}
                </Button>
              )}

              {parseError && (
                <div className="rounded-card border border-alert-red/30 bg-alert-red/5 p-5 space-y-3">
                  <p className="text-sm font-semibold text-alert-red">
                    We couldn&apos;t recognize the format of your file{files.length > 1 ? "s" : ""}.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Try one of these:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                    <li>Select your broker from the dropdown above and re-upload</li>
                    <li>Make sure your CSV has columns for <strong>Symbol/Name</strong>, <strong>Quantity</strong>, and <strong>Avg. Price</strong></li>
                    <li>Remove any extra header rows, footers, or summary lines from the file</li>
                    <li>Save the file as CSV (not Excel .xlsx) with UTF-8 encoding</li>
                  </ul>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    We support exports from Zerodha, Upstox, Kotak Neo, and most brokers.
                    If your format still isn&apos;t recognized, use the column mapper that appears automatically, or try Manual Entry instead.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {/* Duplicate warning banner */}
              {duplicateList.length > 0 && (
                <div className="flex items-start gap-3 rounded-card border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {duplicateList.length} symbol{duplicateList.length !== 1 ? "s" : ""} appear{duplicateList.length === 1 ? "s" : ""} in multiple files
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      {duplicateList.join(", ")} &mdash; duplicates will be merged on import.
                    </p>
                  </div>
                </div>
              )}

              {/* File group sections */}
              {fileGroups.map((group, gi) => (
                <div
                  key={gi}
                  className={`rounded-card border ${
                    group.excluded
                      ? "border-gray-200 dark:border-gray-800 opacity-60"
                      : group.error
                        ? "border-alert-red/30"
                        : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Group header */}
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none"
                    onClick={() => !group.error && toggleFileExpand(gi)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText
                        className={`w-4 h-4 shrink-0 ${
                          group.error ? "text-alert-red" : "text-brand-lime"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">
                            {group.fileName}
                          </span>
                          {group.broker && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-gray-400">
                              {group.broker}
                            </span>
                          )}
                          {!group.error && (
                            <span className="text-xs text-gray-400">
                              {group.rows.length} holding{group.rows.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {group.error && (
                          <p className="text-xs text-alert-red mt-0.5 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {group.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Exclude/include toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFileExclude(gi);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          group.excluded
                            ? "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            : "text-brand-lime hover:text-brand-lime-hover"
                        }`}
                        title={group.excluded ? "Include this file" : "Exclude this file"}
                      >
                        {group.excluded ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      {!group.error && (
                        expandedFiles.has(gi) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Expanded table */}
                  {expandedFiles.has(gi) && !group.error && !group.excluded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-4 pb-4">
                      <EditableTable
                        rows={group.rows}
                        onChange={(rows) => updateGroupRows(gi, rows)}
                        duplicateSymbols={duplicateSymbols}
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={allRows.length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {duplicateList.length > 0 && (
                <div className="flex items-start gap-3 rounded-card border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {duplicateList.join(", ")} appear in multiple files and will be merged.
                  </p>
                </div>
              )}

              <ReviewTable rows={allRows} duplicateSymbols={duplicateSymbols} />

              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" onClick={handleConfirm} loading={confirming}>
                  Import {allRows.length} Holdings
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
