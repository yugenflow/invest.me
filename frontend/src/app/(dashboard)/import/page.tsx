"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { Upload, FileText, Check } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import type { CsvPreviewRow } from "@/types";

export default function ImportPage() {
  const [broker, setBroker] = useState("zerodha");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("broker", broker);
      const res = await api.post("/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data.rows);
      toast.success(`${res.data.count} records found`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await api.post("/import/csv/confirm", { rows: preview, broker });
      setDone(true);
      toast.success("Import complete!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Import failed");
    } finally {
      setConfirming(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-brand-lime" />
          </div>
          <h2 className="text-xl font-heading font-semibold mb-2">Import Complete</h2>
          <p className="text-gray-500 mb-4">{preview.length} holdings imported successfully.</p>
          <Button onClick={() => { setDone(false); setPreview([]); setFile(null); }}>
            Import Another
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold mb-6">Import Holdings</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            id="broker"
            label="Select Broker"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
            options={[
              { value: "zerodha", label: "Zerodha" },
              { value: "upstox", label: "Upstox" },
            ]}
          />
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-brand-lime bg-brand-lime/5"
              : "border-gray-300 dark:border-gray-600 hover:border-brand-lime"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-brand-lime" />
              <span className="font-medium">{file.name}</span>
            </div>
          ) : (
            <p className="text-gray-500">
              Drag & drop your CSV file here, or click to select
            </p>
          )}
        </div>

        {file && !preview.length && (
          <div className="mt-4">
            <Button onClick={handleUpload} loading={uploading}>
              Preview Import
            </Button>
          </div>
        )}
      </Card>

      {preview.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Preview ({preview.length} records)</h3>
            <Button onClick={handleConfirm} loading={confirming}>
              Confirm Import
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3">Symbol</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-right py-2 px-3">Qty</th>
                  <th className="text-right py-2 px-3">Avg Price</th>
                  <th className="text-right py-2 px-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 font-medium">{row.symbol}</td>
                    <td className="py-2 px-3">{row.name}</td>
                    <td className="py-2 px-3 text-right">{row.quantity}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(row.avg_buy_price)}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(row.quantity * row.avg_buy_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
