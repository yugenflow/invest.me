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
import { Plus, Trash2, AlertTriangle } from "lucide-react";
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

type DeleteConfirm =
  | { type: "single"; id: string; name: string }
  | { type: "selected"; ids: string[]; count: number }
  | { type: "all"; count: number }
  | null;

export default function DashboardPage() {
  const { data, loading, refetch: refetchDashboard } = useDashboard();
  const { holdings, loading: holdingsLoading, refetch: refetchHoldings } = useHoldings();
  const [selectedRange, setSelectedRange] = useState(2);
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [performanceData, setPerformanceData] = useState<any[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editHolding, setEditHolding] = useState<Holding | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Single delete — show confirm modal
  const handleDelete = (id: string) => {
    const holding = holdings.find((h) => h.id === id);
    setDeleteConfirm({ type: "single", id, name: holding?.name || holding?.symbol || "this holding" });
  };

  // Delete selected — show confirm modal
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm({ type: "selected", ids: Array.from(selectedIds), count: selectedIds.size });
  };

  // Delete all — show confirm modal
  const handleDeleteAll = () => {
    if (holdings.length === 0) return;
    setDeleteConfirm({ type: "all", count: holdings.length });
  };

  // Execute the confirmed delete
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      if (deleteConfirm.type === "single") {
        await api.delete(`/holdings/${deleteConfirm.id}`);
        toast.success("Holding removed");
      } else {
        const ids =
          deleteConfirm.type === "selected"
            ? deleteConfirm.ids
            : holdings.map((h) => h.id);
        await api.post("/holdings/bulk-delete", { ids });
        const count = ids.length;
        toast.success(`${count} holding${count !== 1 ? "s" : ""} removed`);
      }
      setSelectedIds(new Set());
      refetchHoldings();
      refetchDashboard();
    } catch {
      toast.error("Failed to remove holdings");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
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

  const confirmTitle =
    deleteConfirm?.type === "all"
      ? "Delete All Holdings"
      : deleteConfirm?.type === "selected"
        ? `Delete ${deleteConfirm.count} Holdings`
        : "Delete Holding";

  const confirmMessage =
    deleteConfirm?.type === "all"
      ? `This will remove all ${deleteConfirm.count} holdings from your portfolio.`
      : deleteConfirm?.type === "selected"
        ? `This will remove ${deleteConfirm.count} selected holding${deleteConfirm.count !== 1 ? "s" : ""} from your portfolio.`
        : deleteConfirm?.type === "single"
          ? `This will remove "${deleteConfirm.name}" from your portfolio.`
          : "";

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
          {holdings.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAll}
                className="text-alert-red border-alert-red/30 hover:bg-alert-red/5 hover:border-alert-red/50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete All
              </Button>
            </div>
          )}
        </div>
        {holdingsLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading holdings...</div>
        ) : (
          <HoldingsTable
            holdings={holdings}
            onEdit={openEdit}
            onDelete={handleDelete}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        )}
      </Card>

      {/* Add/Edit Holding Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title={confirmTitle}
        className="max-w-sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-alert-red/10 shrink-0">
              <AlertTriangle className="w-5 h-5 text-alert-red" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {confirmMessage}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={executeDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
