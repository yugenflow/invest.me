"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import StatCard from "@/components/dashboard/StatCard";
import TopMoverCard from "@/components/dashboard/TopMoverCard";
import HoldingsTable from "@/components/dashboard/HoldingsTable";
import HoldingForm from "@/components/portfolio/HoldingForm";
import DonutChart from "@/components/charts/DonutChart";
import PerformanceChart from "@/components/charts/PerformanceChart";
import { useDashboard } from "@/hooks/useDashboard";
import { useHoldings } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { Holding } from "@/types";

const TIME_RANGES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

type ChartMode = "line" | "candles";

export default function DashboardPage() {
  const { data, loading, refetch: refetchDashboard } = useDashboard();
  const { holdings, loading: holdingsLoading, refetch: refetchHoldings } = useHoldings();
  const [selectedRange, setSelectedRange] = useState(2);
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [performanceData, setPerformanceData] = useState<any[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editHolding, setEditHolding] = useState<Holding | undefined>();

  const handleRangeChange = async (index: number) => {
    setSelectedRange(index);
    try {
      const res = await api.get(`/portfolio/performance?days=${TIME_RANGES[index].days}`);
      setPerformanceData(res.data);
    } catch {
      // keep existing data
    }
  };

  const handleChartModeChange = (mode: ChartMode) => {
    if (mode === "candles") {
      toast("Coming soon!", { icon: "🕯️" });
      return;
    }
    setChartMode(mode);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this holding?")) return;
    try {
      await api.delete(`/holdings/${id}`);
      toast.success("Holding removed");
      refetchHoldings();
      refetchDashboard();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const openEdit = (h: Holding) => {
    setEditHolding(h);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditHolding(undefined);
  };

  const handleFormSuccess = () => {
    closeForm();
    refetchHoldings();
    refetchDashboard();
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const summary = data.summary;
  const isPositive = summary.total_gain_loss >= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Holding
        </Button>
      </div>

      {/* Row 1: Net Worth + Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <NetWorthCard summary={summary} />
        <div className="col-span-full lg:col-span-4 grid grid-cols-2 gap-4">
          <StatCard
            label="YTD Return"
            value={formatPercent(summary.total_gain_loss_pct)}
            sub={formatCurrency(summary.total_gain_loss)}
            subColor={isPositive ? "text-gain" : "text-alert-red"}
          />
          <StatCard
            label="Total Invested"
            value={formatCurrency(summary.total_invested)}
          />
          <TopMoverCard holdings={data.top_holdings} />
        </div>
      </div>

      {/* Row 2: Performance Chart + Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <Card className="col-span-full lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-bold">Performance</h3>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 p-1 rounded-lg">
                <button
                  onClick={() => handleChartModeChange("line")}
                  className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                    chartMode === "line"
                      ? "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 text-brand-black dark:text-white font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => handleChartModeChange("candles")}
                  className="px-3 py-1.5 text-sm rounded font-medium transition-colors text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                >
                  Candles
                </button>
              </div>
              <div className="flex gap-1 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 p-1 rounded-lg">
                {TIME_RANGES.map((range, i) => (
                  <button
                    key={range.label}
                    onClick={() => handleRangeChange(i)}
                    className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                      selectedRange === i
                        ? "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 text-brand-black dark:text-white font-bold"
                        : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <PerformanceChart data={performanceData || data.performance} />
        </Card>

        <Card className="col-span-full lg:col-span-4">
          <h3 className="text-lg font-heading font-bold mb-4">Allocation</h3>
          <DonutChart data={data.allocation} />
        </Card>
      </div>

      {/* Row 3: Holdings Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold">Holdings</h3>
        </div>
        {holdingsLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading holdings...</div>
        ) : (
          <HoldingsTable
            holdings={holdings}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editHolding ? "Edit Holding" : "Add Holding"}
        className="max-w-lg"
      >
        <HoldingForm
          holding={editHolding}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}
