"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import type { PortfolioSummary } from "@/types";

interface NetWorthCardProps {
  summary: PortfolioSummary;
}

export default function NetWorthCard({ summary }: NetWorthCardProps) {
  const isPositive = summary.total_gain_loss >= 0;
  const isDayPositive = summary.day_change >= 0;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <Card className="col-span-full lg:col-span-8">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-base text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Net Worth</p>
          <button
            onClick={() => setShowInfo(true)}
            className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
            title="How are these calculated?"
          >
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-5xl font-heading font-extrabold tracking-tight">
            {formatCurrency(summary.current_value)}
          </h2>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-base font-bold ${
              isPositive
                ? "bg-brand-lime/20 text-gain"
                : "bg-red-50 dark:bg-red-900/20 text-alert-red"
            }`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatPercent(summary.total_gain_loss_pct)}
          </span>
        </div>
        <div className="border-t border-gray-100 dark:border-navy-700 pt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Daily P&L</p>
            <span className={`text-xl font-bold ${isDayPositive ? "text-gain" : "text-alert-red"}`}>
              {formatCurrency(summary.day_change)}
            </span>
            <span className={`text-sm font-semibold ml-1.5 ${isDayPositive ? "text-gain" : "text-alert-red"}`}>
              ({formatPercent(summary.day_change_pct)})
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net P&L</p>
            <span className={`text-xl font-bold ${isPositive ? "text-gain" : "text-alert-red"}`}>
              {formatCurrency(summary.total_gain_loss)}
            </span>
            <span className={`text-sm font-semibold ml-1.5 ${isPositive ? "text-gain" : "text-alert-red"}`}>
              ({formatPercent(summary.total_gain_loss_pct)})
            </span>
          </div>
        </div>
      </Card>

      <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="How we calculate your numbers" className="max-w-md">
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Net Worth</h4>
            <p>
              The total current market value of all your holdings. For stocks, ETFs, and crypto, we
              use live market prices updated every 15 minutes. For fixed-income instruments (FDs, PPF,
              EPF, etc.) we use your recorded invested amount.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Total Return (%)</h4>
            <p>
              The overall percentage gain or loss across your portfolio, calculated as:<br />
              <span className="font-mono text-xs bg-gray-100 dark:bg-navy-900 px-1.5 py-0.5 rounded mt-1 inline-block">
                (Current Value - Total Invested) / Total Invested x 100
              </span>
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Daily P&L</h4>
            <p>
              How much your portfolio value changed since the previous trading day&apos;s close. Calculated
              by comparing each holding&apos;s current price against its previous closing price.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Per-holding Gain/Loss</h4>
            <p>
              For each holding, gain/loss is the difference between the current market value and
              your total cost (quantity x average buy price). We don&apos;t require exact purchase
              dates — your average buy price is all we need.
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-navy-700">
            <p className="text-xs text-gray-400">
              Market prices are sourced from Yahoo Finance. Prices may be delayed by up to 15 minutes.
              Non-priceable assets (FDs, PPF, real estate, etc.) are valued at cost.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
