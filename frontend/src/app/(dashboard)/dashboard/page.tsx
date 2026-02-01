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
import PerformanceChart, { type ViewMode } from "@/components/charts/PerformanceChart";
import { useDashboard, useDuplicateGroups } from "@/hooks/useDashboard";
import DuplicateCleanupModal from "@/components/dashboard/DuplicateCleanupModal";
import { useHoldings } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Plus, Trash2, AlertTriangle, CheckSquare, HelpCircle } from "lucide-react";
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
  const { holdings: rawHoldings, loading: holdingsLoading, refetch: refetchHoldings } = useHoldings();
  const { groups: duplicateGroups, refetch: refetchDuplicates } = useDuplicateGroups();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  // Use enriched holdings from dashboard API (with live prices) when available
  const holdings = data?.all_holdings ?? rawHoldings;
  const [selectedRange, setSelectedRange] = useState(2);
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [performanceData, setPerformanceData] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editHolding, setEditHolding] = useState<Holding | undefined>();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>(null);
  const [deleting, setDeleting] = useState(false);
  const [showPerfInfo, setShowPerfInfo] = useState(false);

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

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
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

      {/* Duplicate holdings banner */}
      {duplicateGroups.length > 0 && (
        <div className="flex items-center gap-3 rounded-card border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
            We found <strong>{duplicateGroups.length} group{duplicateGroups.length !== 1 ? "s" : ""}</strong> of duplicate holdings in your portfolio.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 shrink-0"
            onClick={() => setShowDuplicateModal(true)}
          >
            Review & Merge
          </Button>
        </div>
      )}

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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-heading font-bold">Performance</h3>
              <button
                onClick={() => setShowPerfInfo(true)}
                className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                title="How is this chart calculated?"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("portfolio")}
                  className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                    viewMode === "portfolio"
                      ? "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 text-brand-black dark:text-white font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setViewMode("by_category")}
                  className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                    viewMode === "by_category"
                      ? "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 text-brand-black dark:text-white font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                  }`}
                >
                  By Asset Class
                </button>
                <button
                  onClick={() => setViewMode("benchmarks")}
                  className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                    viewMode === "benchmarks"
                      ? "bg-white dark:bg-navy-800 shadow-sm border border-gray-100 dark:border-navy-700 text-brand-black dark:text-white font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-white"
                  }`}
                >
                  vs Indices
                </button>
              </div>
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
          <PerformanceChart data={performanceData || data.performance} viewMode={viewMode} />
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
              {selectMode ? (
                <>
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
                    variant="ghost"
                    size="sm"
                    onClick={exitSelectMode}
                    className="font-semibold text-brand-lime"
                  >
                    Done
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectMode(true)}
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                  Select
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
            selectMode={selectMode}
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

      {/* Duplicate Cleanup Modal */}
      <DuplicateCleanupModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        groups={duplicateGroups}
        onMerged={() => {
          refetchDuplicates();
          refetchHoldings();
          refetchDashboard();
        }}
      />

      {/* Performance Chart Info Modal */}
      <Modal isOpen={showPerfInfo} onClose={() => setShowPerfInfo(false)} title="Understanding the Performance Chart" className="max-w-md">
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Portfolio View</h4>
            <p>
              Shows your total portfolio value over time. Each point is the sum of all your
              holdings valued at that day&apos;s closing price. Non-priceable assets (FDs, PPF, etc.)
              are held constant at cost.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">By Asset Class</h4>
            <p>
              Breaks down your portfolio value by category (Equity, Funds, Gold, Crypto, etc.).
              Each line shows the total value of all holdings in that asset class over time.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">vs Indices</h4>
            <p>
              Compares your portfolio against major benchmarks. Benchmark values are <strong>normalized</strong> to
              your portfolio&apos;s starting value on the first day of the chart. This answers: <em>&ldquo;If I had invested
              the same amount in Nifty 50 / S&P 500 / Gold / Bitcoin instead, what would it be worth today?&rdquo;</em>
            </p>
            <p className="mt-2">
              Lines above your portfolio mean that benchmark outperformed you. Lines below mean you beat it.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-navy-700">
            <p className="text-xs text-gray-400">
              Historical prices are sourced from Yahoo Finance (end-of-day close). Weekends and holidays
              carry forward the last known price. Data is backfilled for up to 1 year when a holding is first added.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
