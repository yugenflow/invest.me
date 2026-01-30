"use client";

import { useState } from "react";
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
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { ImportRow, ColumnMapping } from "@/types";

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
  const [file, setFile] = useState<File | null>(null);
  const [broker, setBroker] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [detectedBroker, setDetectedBroker] = useState<string | null>(null);
  const [showMapper, setShowMapper] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [done, setDone] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const [parseError, setParseError] = useState(false);

  const { uploadCsv, confirmImport, uploading, confirming } = useImport();

  const reset = () => {
    setStep(0);
    setFile(null);
    setBroker("");
    setRows([]);
    setDetectedBroker(null);
    setShowMapper(false);
    setCsvHeaders([]);
    setColumnMapping({});
    setDone(false);
    setShowFormatHelp(false);
    setParseError(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleUpload = async (uploadFile?: File, mapping?: ColumnMapping) => {
    const f = uploadFile || file;
    if (!f) return;
    try {
      const result = await uploadCsv(f, mapping, broker || undefined);
      setDetectedBroker(result.detected_broker);

      setParseError(false);
      if (result.rows.length > 0) {
        setRows(result.rows);
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
    } catch (err: any) {
      setParseError(true);
      toast.error(err.response?.data?.detail || "Upload failed");
    }
  };

  const handleMapperSubmit = () => {
    handleUpload(undefined, columnMapping);
  };

  const handleConfirm = async () => {
    const validRows = rows.filter((r) => r.symbol && r.quantity > 0);
    if (validRows.length === 0) {
      toast.error("No valid holdings to import");
      return;
    }
    try {
      await confirmImport(validRows, detectedBroker || broker || "csv");
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
        <SuccessState count={rows.length} onClose={handleClose} />
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

              <DropZone file={file} onFile={setFile} />

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
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Your CSV needs at least these <strong>4 columns</strong>. The column names can vary &mdash; we&apos;ll auto-detect them.
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
                          <td className="py-2 px-3 font-medium">Symbol</td>
                          <td className="py-2 px-3">Stock ticker or identifier</td>
                          <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Symbol</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Ticker</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Instrument</code></td>
                          <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 px-3 font-medium">Quantity</td>
                          <td className="py-2 px-3">Number of shares/units</td>
                          <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Qty</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Net Qty</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Shares</code></td>
                          <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 px-3 font-medium">Avg Price</td>
                          <td className="py-2 px-3">Average buy price per unit</td>
                          <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Avg. Price</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Avg. cost</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Average Price</code></td>
                          <td className="py-2 px-3 text-center text-brand-lime font-bold">Yes</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Category</td>
                          <td className="py-2 px-3">Asset class or segment</td>
                          <td className="py-2 px-3"><code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Category</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Segment</code> <code className="text-xs bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded">Asset Class</code></td>
                          <td className="py-2 px-3 text-center text-gray-400">Optional</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    We auto-detect exports from <strong>Zerodha</strong>, <strong>Upstox</strong>, <strong>Kotak Neo</strong>, and most standard broker formats.
                    LTP, current value, P&amp;L, and other columns are ignored &mdash; we derive them from live market data. Summary rows and blank lines are skipped automatically.
                  </p>
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

              {file && !showMapper && (
                <Button size="lg" onClick={() => handleUpload()} loading={uploading}>
                  Upload & Parse
                </Button>
              )}

              {parseError && (
                <div className="rounded-card border border-alert-red/30 bg-alert-red/5 p-5 space-y-3">
                  <p className="text-sm font-semibold text-alert-red">
                    We couldn&apos;t recognize the format of your file.
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
            <div>
              <EditableTable rows={rows} onChange={setRows} />
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(2)}>Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <ReviewTable rows={rows} />
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" onClick={handleConfirm} loading={confirming}>
                  Import {rows.length} Holdings
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
