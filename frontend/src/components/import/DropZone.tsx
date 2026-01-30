"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";

interface DropZoneProps {
  file: File | null;
  onFile: (file: File) => void;
}

export default function DropZone({ file, onFile }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onFile(acceptedFiles[0]);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  return (
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
      {file ? (
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-5 h-5 text-brand-lime" />
          <span className="text-base font-semibold">{file.name}</span>
        </div>
      ) : (
        <>
          <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
            Drag & drop your CSV file here
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            or click to browse
          </p>
        </>
      )}
    </div>
  );
}
