"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useAssetClasses } from "@/hooks/usePortfolio";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { Holding, AssetClass } from "@/types";

interface HoldingFormProps {
  holding?: Holding;
  onSuccess: () => void;
  onCancel: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  symbol: "Symbol/Ticker",
  name: "Name",
  quantity: "Quantity",
  avg_buy_price: "Average Buy Price",
  buy_currency: "Currency",
  exchange: "Exchange",
  buy_date: "Buy Date",
  maturity_date: "Maturity Date",
  interest_rate: "Interest Rate (%)",
  institution: "Institution",
  sebi_category: "SEBI Category",
};

const FIELD_TYPES: Record<string, string> = {
  quantity: "number",
  avg_buy_price: "number",
  interest_rate: "number",
  buy_date: "date",
  maturity_date: "date",
};

export default function HoldingForm({ holding, onSuccess, onCancel }: HoldingFormProps) {
  const assetClasses = useAssetClasses();
  const [assetClassCode, setAssetClassCode] = useState(holding?.asset_class_code || "");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedClass = assetClasses.find((ac) => ac.code === assetClassCode);
  const allFields = selectedClass
    ? [...(selectedClass.fields_schema?.required || []), ...(selectedClass.fields_schema?.optional || [])]
    : [];

  useEffect(() => {
    if (holding) {
      setAssetClassCode(holding.asset_class_code);
      const data: Record<string, string> = {};
      for (const key of Object.keys(FIELD_LABELS)) {
        const val = (holding as any)[key];
        if (val !== null && val !== undefined) data[key] = String(val);
      }
      setFormData(data);
    }
  }, [holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { asset_class_code: assetClassCode };
      for (const field of allFields) {
        const val = formData[field];
        if (val !== undefined && val !== "") {
          if (FIELD_TYPES[field] === "number") {
            payload[field] = parseFloat(val);
          } else {
            payload[field] = val;
          }
        }
      }

      if (holding) {
        await api.patch(`/holdings/${holding.id}`, payload);
        toast.success("Holding updated");
      } else {
        await api.post("/holdings", payload);
        toast.success("Holding added");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="asset_class"
        label="Asset Class"
        value={assetClassCode}
        onChange={(e) => {
          setAssetClassCode(e.target.value);
          setFormData({});
        }}
        options={[
          { value: "", label: "Select asset class..." },
          ...assetClasses.map((ac) => ({ value: ac.code, label: ac.name })),
        ]}
        disabled={!!holding}
      />

      {selectedClass && allFields.map((field) => (
        <Input
          key={field}
          id={field}
          label={FIELD_LABELS[field] || field}
          type={FIELD_TYPES[field] || "text"}
          value={formData[field] || ""}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          required={selectedClass.fields_schema?.required?.includes(field)}
        />
      ))}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} disabled={!assetClassCode}>
          {holding ? "Update" : "Add Holding"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
