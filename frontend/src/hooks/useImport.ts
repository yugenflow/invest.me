"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { CsvUploadResult, ImportRow, ColumnMapping, FileGroup } from "@/types";

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

  const uploadMultipleCsv = async (
    files: File[],
    columnMapping?: ColumnMapping,
    broker?: string,
  ): Promise<FileGroup[]> => {
    setUploading(true);
    try {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          if (broker) formData.append("broker", broker);
          if (columnMapping) formData.append("column_mapping", JSON.stringify(columnMapping));
          const res = await api.post("/import/csv", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          return { file, data: res.data as CsvUploadResult };
        }),
      );

      return results.map((result, i) => {
        if (result.status === "fulfilled") {
          const { data } = result.value;
          return {
            fileName: files[i].name,
            broker: data.detected_broker,
            rows: data.rows,
            excluded: data.rows.length === 0,
            error: data.rows.length === 0 ? "No holdings found in this file" : undefined,
          };
        }
        const reason = result.reason as any;
        return {
          fileName: files[i].name,
          broker: null,
          rows: [],
          error: reason?.response?.data?.detail || reason?.message || "Upload failed",
          excluded: true,
        };
      });
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

  return { uploadCsv, uploadMultipleCsv, confirmImport, uploading, confirming };
}
