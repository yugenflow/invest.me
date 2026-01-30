"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import StepIndicator from "./StepIndicator";
import EditableTable from "./EditableTable";
import ReviewTable from "./ReviewTable";
import SuccessState from "./SuccessState";
import { useImport } from "@/hooks/useImport";
import toast from "react-hot-toast";
import type { ImportRow } from "@/types";

const STEPS = ["Entry", "Confirm"];

const ASSET_CLASS_OPTIONS = [
  { value: "EQUITY_IN", label: "Indian Equity" },
  { value: "EQUITY_US", label: "US Equity" },
  { value: "MF", label: "Mutual Fund" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "FD", label: "Fixed Deposit" },
  { value: "GOLD", label: "Gold" },
];

const BLANK_ROW: ImportRow = {
  symbol: "",
  name: "",
  quantity: 0,
  avg_buy_price: 0,
  asset_class_code: "EQUITY_IN",
  buy_currency: "INR",
};

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<ImportRow[]>([{ ...BLANK_ROW }]);
  const [defaultAssetClass, setDefaultAssetClass] = useState("EQUITY_IN");
  const [done, setDone] = useState(false);

  const { confirmImport, confirming } = useImport();

  const reset = () => {
    setStep(0);
    setRows([{ ...BLANK_ROW }]);
    setDefaultAssetClass("EQUITY_IN");
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDefaultAssetClassChange = (value: string) => {
    setDefaultAssetClass(value);
    setRows(rows.map((r) => ({ ...r, asset_class_code: value })));
  };

  const handleReview = () => {
    const validRows = rows.filter((r) => r.symbol && r.quantity > 0);
    if (validRows.length === 0) {
      toast.error("Add at least one holding with a symbol and quantity");
      return;
    }
    setStep(1);
  };

  const handleConfirm = async () => {
    const validRows = rows.filter((r) => r.symbol && r.quantity > 0);
    try {
      await confirmImport(validRows, "manual");
      setDone(true);
      toast.success("Import complete!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Import failed");
    }
  };

  const validCount = rows.filter((r) => r.symbol && r.quantity > 0).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Entry"
      className="max-w-4xl max-h-[85vh] overflow-y-auto"
    >
      {done ? (
        <SuccessState count={validCount} onClose={handleClose} />
      ) : (
        <>
          <StepIndicator steps={STEPS} current={step} />

          {step === 0 && (
            <div>
              <div className="mb-5 max-w-xs">
                <Select
                  id="default-asset-class"
                  label="Default Asset Class"
                  value={defaultAssetClass}
                  onChange={(e) =>
                    handleDefaultAssetClassChange(e.target.value)
                  }
                  options={ASSET_CLASS_OPTIONS}
                />
              </div>

              <EditableTable rows={rows} onChange={setRows} showAddRow />

              <div className="flex justify-end mt-6">
                <Button size="lg" onClick={handleReview} disabled={validCount === 0}>
                  Review ({validCount})
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <ReviewTable
                rows={rows.filter((r) => r.symbol && r.quantity > 0)}
              />
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={handleConfirm} loading={confirming}>
                  Import {validCount} Holdings
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
