"use client";

import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface TopHoldingsProps {
  holdings: Array<{
    name: string;
    symbol?: string;
    asset_class_code: string;
    value: number;
    buy_currency: string;
  }>;
}

export default function TopHoldings({ holdings }: TopHoldingsProps) {
  return (
    <Card>
      <h3 className="font-heading font-semibold mb-4">Top Holdings</h3>
      {holdings.length === 0 ? (
        <p className="text-sm text-gray-500">No holdings yet</p>
      ) : (
        <div className="space-y-3">
          {holdings.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="font-medium text-sm">{h.name}</p>
                <p className="text-xs text-gray-500">{h.symbol || h.asset_class_code}</p>
              </div>
              <p className="font-semibold text-sm">{formatCurrency(h.value, h.buy_currency)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
