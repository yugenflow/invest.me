"use client";

import Card from "@/components/ui/Card";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">{title}</h1>
      <Card className="text-center py-16">
        <Construction className="w-16 h-16 mx-auto mb-4 text-brand-lime" />
        <h2 className="text-xl font-heading font-semibold mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{description}</p>
      </Card>
    </div>
  );
}
