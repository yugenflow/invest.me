"use client";

import { useState } from "react";
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
  Newspaper,
  Activity,
  CreditCard,
  User,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { label: "Portfolio", href: "/dashboard", icon: Briefcase },
  { label: "Import", href: "/import", icon: Upload },
  { label: "Smart Advisor", href: "/advisor", icon: Brain },
  { label: "Market Intel", href: "/market-intel", icon: LineChart },
  { label: "Rebalance", href: "/rebalance", icon: RefreshCw },
  { label: "New Avenues", href: "/new-avenues", icon: Compass },
  { label: "Expert Opinion", href: "/expert-opinion", icon: Newspaper, badge: "Soon" },
  { label: "Sentiment Index", href: "/sentiment", icon: Activity, badge: "Soon" },
  { label: "Manage Subscription", href: "/subscription", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 transition-all duration-300",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar"
      )}
    >
      <div className="flex items-center justify-between p-5">
        {!collapsed && (
          <Link href="/dashboard" className="text-2xl font-heading font-extrabold text-brand-black dark:text-white tracking-tight">
            <span className="text-brand-lime mr-1">&#9670;</span>Invest<span className="text-brand-lime">.me</span>
          </Link>
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
  );
}
