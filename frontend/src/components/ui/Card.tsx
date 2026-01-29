"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export default function Card({ className, glass, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card p-6",
        glass
          ? "bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm border border-gray-200 dark:border-navy-700"
          : "bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
