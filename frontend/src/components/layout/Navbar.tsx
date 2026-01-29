"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Home as HomeIcon,
  Users,
  Briefcase,
  Layers,
  Lightbulb,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        <Link href="/" className="text-2xl font-heading font-bold text-navy-900 tracking-tight">
          <span className="text-brand-lime mr-1">&#9670;</span>
          Invest<span className="text-brand-lime">.me</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", icon: HomeIcon, href: "/" },
            { label: "About", icon: Users, href: "/about" },
            { label: "Services", icon: Briefcase, href: "/services" },
            { label: "Solutions", icon: Lightbulb, href: "/solutions" },
            { label: "Community", icon: Layers, href: "/community" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 text-[0.95rem] font-medium text-gray-500 hover:text-navy-900 transition-colors duration-200"
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition shadow-sm"
        >
          Sign In
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
