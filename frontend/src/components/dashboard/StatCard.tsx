"use client";

import Card from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

export default function StatCard({ label, value, sub, subColor }: StatCardProps) {
  return (
    <Card className="shadow-subtle">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-heading font-bold">{value}</p>
      {sub && (
        <p className={`text-sm mt-1 font-semibold ${subColor ?? "text-gray-400"}`}>{sub}</p>
      )}
    </Card>
  );
}
