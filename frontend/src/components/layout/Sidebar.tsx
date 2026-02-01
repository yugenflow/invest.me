"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Upload,
  Settings,
  Brain,
  LineChart,
  RefreshCw,
  Compass,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
  CreditCard,
  User,
  Sparkles,
  X,
  Check,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { label: "Portfolio", href: "/dashboard", icon: Briefcase },
  { label: "Import", href: "/import", icon: Upload },
  { label: "Smart Advisor", href: "/advisor", icon: Brain },
  { label: "Market Intel", href: "/market-intel", icon: LineChart },
  { label: "Rebalance", href: "/rebalance", icon: RefreshCw },
  { label: "New Avenues", href: "/new-avenues", icon: Compass },
  { label: "Sentiment Index", href: "/sentiment", icon: Activity, badge: "Soon" },
  { label: "Manage Subscription", href: "/subscription", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 transition-all duration-300",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar"
      )}
    >
      <div className="flex items-center justify-between p-5">
        {!collapsed && (
          <>
            <Link href="/dashboard" className="text-2xl font-heading font-extrabold text-brand-black dark:text-white tracking-tight">
              <span className="text-brand-lime mr-1">&#9670;</span>Invest<span className="text-brand-lime">.me</span>
            </Link>
            <button
              onClick={() => setShowBetaModal(true)}
              className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-brand-lime text-brand-black rounded-full hover:bg-brand-lime/80 transition-colors"
            >
              Beta
            </button>
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-brand-lime text-brand-black font-bold shadow-sm"
                  : "text-gray-500 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-navy-700 hover:text-brand-black dark:hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-base flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-lime/20 text-brand-lime leading-none">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro CTA */}
      {!collapsed && !user?.is_pro && (
        <div className="mx-4 mb-3 p-4 rounded-card bg-gradient-to-br from-brand-lime/10 to-brand-lime/5 border border-brand-lime/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-lime" />
            <span className="text-sm font-bold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Unlock expert opinions, sentiment analysis & more.</p>
          <Link
            href="/subscription"
            className="block text-center text-sm font-bold py-2 rounded-lg bg-brand-lime text-brand-black hover:bg-brand-lime/90 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* User Profile */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-lime/20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-brand-lime" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold truncate">{user?.full_name || "User"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 border-t border-gray-200 dark:border-navy-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 hover:text-brand-black dark:hover:text-white transition-all mt-1"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-base">Logout</span>}
        </button>
      </div>
    </aside>
    {/* Beta Info Modal — portaled to body so it overlays everything */}
    {mounted && showBetaModal && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBetaModal(false)}>
        <div
          className="w-[540px] max-h-[85vh] overflow-y-auto rounded-card border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 shadow-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-lime text-brand-black rounded-full">Beta</span>
              <h3 className="text-xl font-bold">What&apos;s supported</h3>
            </div>
            <button onClick={() => setShowBetaModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-bold text-brand-lime mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> Currently supported
              </h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 ml-1">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime mt-1.5 shrink-0" />
                  <span><strong>Indian Equity</strong> — CSV import (Zerodha, Upstox, Kotak Neo), manual entry, live prices</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime mt-1.5 shrink-0" />
                  <span><strong>Indian Mutual Funds</strong> — manual entry with auto-resolution, live NAV</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime mt-1.5 shrink-0" />
                  <span><strong>Gold</strong> (Physical, SGB, ETF, Digital) — manual entry</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime mt-1.5 shrink-0" />
                  <span><strong>FD, PPF, EPF, NPS, Bonds, Real Estate</strong> — manual entry, cost basis tracking</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 dark:border-navy-700 pt-5">
              <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Coming soon
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 ml-1">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  MF CAS (Consolidated Account Statement) PDF import
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  CSV import for Crypto
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  Broker API connectors (Zerodha, Upstox, Groww)
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  US Equity &amp; Crypto live pricing
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  Smart Advisor — AI-powered recommendations across all asset classes
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  Market Intel — news, sector analysis &amp; insights
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  Sentiment Index — real-time market mood from news &amp; social signals
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
                  New Avenues — upcoming IPOs, new funds &amp; alternative investments
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
