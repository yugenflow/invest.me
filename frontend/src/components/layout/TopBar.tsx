"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Portfolio",
  "/import": "Import",
  "/advisor": "Smart Advisor",
  "/market-intel": "Market Intel",
  "/rebalance": "Rebalance",
  "/new-avenues": "New Avenues",
  "/expert-opinion": "Expert Opinion",
  "/sentiment": "Sentiment Index",
  "/subscription": "Manage Subscription",
  "/settings": "Settings",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="h-16 border-b border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <div className="flex items-center gap-5">
        <div className="relative w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-11 pr-4 py-2.5 text-base rounded-full border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-lime focus:border-brand-lime"
          />
        </div>
        <ThemeToggle />
        <button className="relative p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">
          <Bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-lime rounded-full border-2 border-white dark:border-navy-800" />
        </button>
      </div>
    </header>
  );
}
