"use client";

import { useState } from "react";
import MethodCard from "@/components/import/MethodCard";
import CsvImportModal from "@/components/import/CsvImportModal";
import ManualEntryModal from "@/components/import/ManualEntryModal";
import { Plug, Camera, FileSpreadsheet, PenLine } from "lucide-react";

export default function ImportPage() {
  const [csvOpen, setCsvOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto">
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
