"use client";

import { useState } from "react";
import MethodCard from "@/components/import/MethodCard";
import CsvImportModal from "@/components/import/CsvImportModal";
import ManualEntryModal from "@/components/import/ManualEntryModal";
import {
  Plug,
  Camera,
  FileSpreadsheet,
  PenLine,
  BookOpen,
  TrendingUp,
  Layers,
  ChevronDown,
  Lightbulb,
} from "lucide-react";

export default function ImportPage() {
  const [csvOpen, setCsvOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* How to Import Guide */}
      <div className="mb-6 rounded-[14px] border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-5.5 w-5.5 text-brand-lime" />
            <span className="font-semibold text-base text-gray-900 dark:text-white">
              How to import your holdings
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              showGuide ? "rotate-180" : ""
            }`}
          />
        </button>

        {showGuide && (
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Indian Equity */}
              <div className="flex flex-col rounded-xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <FileSpreadsheet className="h-5 w-5 text-brand-lime" />
                  <h3 className="font-semibold text-sm/snug text-gray-900 dark:text-white">
                    Indian Equity
                  </h3>
                </div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
                  Export your holdings as CSV from your broker and upload here.
                  We auto-detect formats from{" "}
                  <strong className="text-gray-700 dark:text-gray-300">Zerodha</strong>,{" "}
                  <strong className="text-gray-700 dark:text-gray-300">Upstox</strong>, and{" "}
                  <strong className="text-gray-700 dark:text-gray-300">Kotak Neo</strong>.
                  Most other brokers work too, as long as your CSV has the
                  required columns — see the format guide in the CSV / Excel
                  upload. Upload multiple files at once — we&apos;ll handle
                  merging and deduplication.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                    CSV / Excel
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                    Manual Entry
                  </span>
                </div>
              </div>

              {/* Indian Mutual Funds */}
              <div className="flex flex-col rounded-xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <TrendingUp className="h-5 w-5 text-brand-lime" />
                  <h3 className="font-semibold text-sm/snug text-gray-900 dark:text-white">
                    Indian Mutual Funds
                  </h3>
                </div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
                  Use{" "}
                  <strong className="text-gray-700 dark:text-gray-300">Manual Entry</strong>{" "}
                  — type your fund names and we&apos;ll auto-resolve them to
                  live NAV tracking via Yahoo Finance.{" "}
                  <strong className="text-gray-700 dark:text-gray-300">
                    CAS PDF import
                  </strong>{" "}
                  is coming soon.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                    Manual Entry
                  </span>
                </div>
              </div>

              {/* Other Assets */}
              <div className="flex flex-col rounded-xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Layers className="h-5 w-5 text-brand-lime" />
                  <h3 className="font-semibold text-sm/snug text-gray-900 dark:text-white">
                    Other Assets
                  </h3>
                </div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">
                  Gold (Physical, SGB, ETF, Digital), Fixed Deposits, PPF, EPF,
                  NPS, Bonds, and Real Estate — add via{" "}
                  <strong className="text-gray-700 dark:text-gray-300">Manual Entry</strong>{" "}
                  with cost basis tracking.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-lime/10 text-brand-lime border border-brand-lime/20">
                    Manual Entry
                  </span>
                </div>
              </div>
            </div>

            {/* Tip footer */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Tip: You can upload multiple CSV files at once — we&apos;ll
                detect duplicates and let you merge, replace, or skip conflicts.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MethodCard
          icon={Plug}
          title="Broker Connectors"
          description="Directly sync your holdings automatically from your brokerage account."
          timeEstimate="~1 min"
          ctaLabel="Connect Broker"
          disabled
          platforms={["Upstox", "Zerodha", "Groww", "Binance"]}
        />
        <MethodCard
          icon={Camera}
          title="Screenshot Import"
          description="Take a screenshot of your holdings screen and we'll extract the data using AI."
          timeEstimate="~3 min"
          ctaLabel="Upload Screenshot"
          disabled
        />
        <MethodCard
          icon={FileSpreadsheet}
          title="CSV / Excel"
          description="Upload any CSV export from your broker. We auto-detect the format or you can select your broker manually."
          timeEstimate="~4 min"
          ctaLabel="Upload File"
          onClick={() => setCsvOpen(true)}
          recommended
        />
        <MethodCard
          icon={PenLine}
          title="Manual Entry"
          description="Add your holdings one by one in a spreadsheet-style table. Great for small portfolios."
          timeEstimate="~10 min"
          ctaLabel="Start Entry"
          onClick={() => setManualOpen(true)}
        />
      </div>

      <CsvImportModal isOpen={csvOpen} onClose={() => setCsvOpen(false)} />
      <ManualEntryModal isOpen={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  );
}
