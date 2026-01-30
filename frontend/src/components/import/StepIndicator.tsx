"use client";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                i <= current
                  ? "bg-brand-lime"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                i <= current
                  ? "text-brand-black dark:text-white"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-10 h-0.5 rounded ${
                i < current
                  ? "bg-brand-lime"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
