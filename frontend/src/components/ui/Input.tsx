"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3 py-2 rounded-lg border bg-white dark:bg-surface-dark-card text-brand-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime",
            error ? "border-alert-red" : "border-gray-300 dark:border-gray-600",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-alert-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
