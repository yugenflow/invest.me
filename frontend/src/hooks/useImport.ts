"use client";

import { useState } from "react";
import api from "@/lib/api";
import type { CsvUploadResult, ImportRow, ColumnMapping, FileGroup, MfResolveResult, DuplicateCheckResult, RowAction } from "@/types";

export function useImport() {
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

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

  const checkDuplicates = async (rows: ImportRow[]): Promise<DuplicateCheckResult> => {
    setCheckingDuplicates(true);
    try {
      const res = await api.post("/import/check-duplicates", { rows });
      return res.data;
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const confirmImport = async (
    rows: ImportRow[],
    broker: string,
    actions?: RowAction[],
  ): Promise<void> => {
    setConfirming(true);
    try {
      await api.post("/import/csv/confirm", { rows, broker, actions });
    } finally {
      setConfirming(false);
    }
  };

  const resolveMfNames = async (fundNames: string[]): Promise<MfResolveResult[]> => {
    setResolving(true);
    try {
      const res = await api.post("/import/resolve-mf", { fund_names: fundNames });
      return res.data.results;
    } finally {
      setResolving(false);
    }
  };

  const resolveIsin = async (isin: string): Promise<{ resolved: boolean; yf_ticker?: string }> => {
    const res = await api.post("/import/resolve-isin", { isin });
    return res.data;
  };

  return { uploadCsv, uploadMultipleCsv, checkDuplicates, confirmImport, resolveMfNames, resolveIsin, uploading, confirming, resolving, checkingDuplicates };
}
