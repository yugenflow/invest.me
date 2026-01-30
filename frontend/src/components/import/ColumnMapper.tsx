"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { ColumnMapping } from "@/types";

const OUR_FIELDS = [
  { value: "", label: "-- Skip --" },
  { value: "symbol", label: "Symbol / Ticker" },
  { value: "name", label: "Company Name" },
  { value: "quantity", label: "Quantity" },
  { value: "avg_buy_price", label: "Average Price" },
  { value: "asset_class_code", label: "Asset Class" },
  { value: "exchange", label: "Exchange" },
  { value: "buy_currency", label: "Currency" },
];

interface ColumnMapperProps {
  headers: string[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function ColumnMapper({
  headers,
  mapping,
  onChange,
  onSubmit,
  loading,
}: ColumnMapperProps) {
  const reverseMapping: Record<string, string> = {};
  for (const [field, header] of Object.entries(mapping)) {
    reverseMapping[header] = field;
  }

  const handleChange = (header: string, field: string) => {
    const next = { ...mapping };
    for (const [f, h] of Object.entries(next)) {
      if (h === header) delete next[f];
    }
    if (field) {
      next[field] = header;
    }
    onChange(next);
  };

  const hasRequired =
    Object.values(mapping).length >= 2 &&
    "symbol" in mapping &&
    "quantity" in mapping;

  return (
    <div className="rounded-card border border-gray-200 dark:border-gray-700 p-5">
      <p className="text-base text-gray-600 dark:text-gray-300 mb-5">
        We couldn&apos;t auto-detect your CSV format. Map each column to the
        correct field below.
      </p>
      <div className="space-y-3 mb-5">
        {headers.map((header) => (
          <div key={header} className="flex items-center gap-4">
            <span className="w-44 text-base font-medium truncate" title={header}>
              {header}
            </span>
            <div className="flex-1">
              <Select
                id={`map-${header}`}
                value={reverseMapping[header] || ""}
                onChange={(e) => handleChange(header, e.target.value)}
                options={OUR_FIELDS}
              />
            </div>
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onSubmit} disabled={!hasRequired} loading={loading}>
        Apply Mapping
      </Button>
    </div>
  );
}
