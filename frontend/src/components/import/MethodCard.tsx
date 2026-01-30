"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  timeEstimate: string;
  ctaLabel: string;
  onClick?: () => void;
  disabled?: boolean;
  recommended?: boolean;
  platforms?: string[];
}

export default function MethodCard({
  icon: Icon,
  title,
  description,
  timeEstimate,
  ctaLabel,
  onClick,
  disabled,
  recommended,
  platforms,
}: MethodCardProps) {
  return (
    <Card
      className={`flex flex-col h-full relative p-7 transition-shadow hover:shadow-lg ${
        recommended
          ? "ring-2 ring-brand-lime/40"
          : disabled
            ? "opacity-70"
            : ""
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider bg-brand-lime text-brand-black px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
          Recommended
        </span>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6">
        <Clock className="w-4 h-4" />
        <span>{timeEstimate}</span>
      </div>

      <div className="w-14 h-14 rounded-xl bg-brand-lime/10 flex items-center justify-center mb-5 mx-auto">
        <Icon className="w-7 h-7 text-brand-lime" />
      </div>

      <h3 className="font-heading font-bold text-xl mb-3 text-center">{title}</h3>
      <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-4 text-center">
        {description}
      </p>

      {platforms && platforms.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {platforms.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
              {name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto">
        {disabled ? (
          <div>
            <Button variant="outline" disabled size="lg" className="w-full">
              {ctaLabel}
            </Button>
            <span className="block text-center text-sm text-gray-400 mt-2.5 font-medium">
              Coming Soon
            </span>
          </div>
        ) : (
          <Button onClick={onClick} size="lg" className="w-full">
            {ctaLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
