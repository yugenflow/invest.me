"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";

interface DropZoneProps {
  files: File[];
  onFiles: (files: File[]) => void;
}

export default function DropZone({ files, onFiles }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFiles([...files, ...acceptedFiles]);
      }
    },
    [files, onFiles],
  );

  const removeFile = (index: number) => {
    onFiles(files.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 10,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-brand-lime bg-brand-lime/5"
            : "border-gray-300 dark:border-gray-600 hover:border-brand-lime"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {files.length === 0 ? (
          <>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
              Drag & drop your CSV files here
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              or click to browse &mdash; upload up to 10 files at once
            </p>
          </>
        ) : (
          <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
            Drop more files to add them
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-brand-lime shrink-0" />
                <span className="text-sm font-medium truncate">{file.name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="p-1 text-gray-400 hover:text-alert-red transition-colors rounded hover:bg-gray-100 dark:hover:bg-navy-700"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
