"use client";

import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface SuccessStateProps {
  count: number;
  onClose: () => void;
}

export default function SuccessState({ count, onClose }: SuccessStateProps) {
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-5">
        <Check className="w-10 h-10 text-brand-lime" />
      </div>
      <h2 className="text-2xl font-heading font-bold mb-2">
        Import Complete
      </h2>
      <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
        {count} holding{count !== 1 ? "s" : ""} imported successfully.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/dashboard">
          <Button size="lg">View Portfolio</Button>
        </Link>
        <Button variant="outline" size="lg" onClick={onClose}>
          Import More
        </Button>
      </div>
    </div>
  );
}
