"use client";

import Link from "next/link";
import { Smartphone } from "lucide-react";

const footerColumns = [
  {
    heading: "About Us",
    links: [
      { label: "Who We Are", href: "/about#who-we-are" },
      { label: "Our Mission", href: "/about#mission" },
      { label: "Our Vision", href: "/about#vision" },
      { label: "Our Story", href: "/about#story" },
      { label: "Leadership Team", href: "/about#leadership" },
      { label: "Corporate Responsibility", href: "/about#responsibility" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Portfolio Tracking", href: "/services#portfolio-tracking" },
      { label: "Smart Advisor", href: "/services#smart-advisor" },
      { label: "Risk Profiling", href: "/services#risk-profiling" },
      { label: "Market Intelligence", href: "/services#market-intelligence" },
      { label: "Rebalancing Tools", href: "/services#rebalancing" },
      { label: "Broker Integration", href: "/services#broker-integration" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Wealth Management", href: "/solutions#wealth-management" },
      { label: "Retirement Planning", href: "/solutions#retirement-planning" },
      { label: "Goal-Based Investing", href: "/solutions#goal-based-investing" },
      { label: "Crypto Tracking", href: "/solutions#crypto-tracking" },
      { label: "Mutual Fund Analysis", href: "/solutions#mutual-fund-analysis" },
      { label: "Equity Research", href: "/solutions#equity-research" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Join the Community", href: "/community" },
      { label: "Events & Webinars", href: "/community" },
      { label: "Investor Stories", href: "/community" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-10">
        <div className="grid lg:grid-cols-6 gap-12 mb-20">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-heading font-bold text-gray-900 block mb-6">
              <span className="text-brand-lime mr-1">&#9670;</span>
              Invest<span className="text-brand-lime">.me</span>
            </Link>
            <div className="text-sm text-gray-500 leading-relaxed space-y-0.5 mb-5">
              <p>Technology Park</p>
              <p>8-14 Marie Curie Street</p>
              <p>08042 Santa Marine</p>
            </div>
            <p className="text-sm text-gray-900 font-medium mb-6">
              support@investme.com
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4 mb-8">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all" aria-label="Instagram">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all" aria-label="LinkedIn">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all" aria-label="X">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            </div>

            {/* App download */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Get the Invest.me App
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                  <div className="text-left">
                    <div className="text-[8px] leading-tight opacity-70">Download on the</div>
                    <div className="text-[12px] font-semibold leading-tight">App Store</div>
                  </div>
                </a>
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.188 12l2.51-2.492zM5.864 2.658L16.8 9.99l-2.302 2.302L5.864 3.658z" /></svg>
                  <div className="text-left">
                    <div className="text-[8px] leading-tight opacity-70">Get it on</div>
                    <div className="text-[12px] font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-gray-900 mb-6">{col.heading}</h4>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="#" className="text-sm text-gray-900 font-medium hover:text-gray-600 transition">
            Privacy and Policy
          </a>
          <span className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Invest.me. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
