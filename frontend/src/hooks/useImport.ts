"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { CsvUploadResult, ImportRow, ColumnMapping } from "@/types";

export function useImport() {
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const uploadCsv = async (
    file: File,
    columnMapping?: ColumnMapping,
    broker?: string,
  ): Promise<CsvUploadResult> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (broker) {
        formData.append("broker", broker);
      }
      if (columnMapping) {
        formData.append("column_mapping", JSON.stringify(columnMapping));
      }
      const res = await api.post("/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } finally {
      setUploading(false);
    }
  };

  const confirmImport = async (
    rows: ImportRow[],
    broker: string,
  ): Promise<void> => {
    setConfirming(true);
    try {
      await api.post("/import/csv/confirm", { rows, broker });
    } finally {
      setConfirming(false);
    }
  };

  return { uploadCsv, confirmImport, uploading, confirming };
}
