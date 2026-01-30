"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Check, X, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const TIERS = [
  {
    name: "Basic",
    monthlyPrice: 499,
    annualPrice: 4999,
    description: "For beginners tracking their portfolio",
    popular: false,
    features: [
      { text: "Portfolio Dashboard", included: true },
      { text: "Import Holdings (CSV & manual)", included: true },
      { text: "Basic Smart Advisor (5 queries/mo)", included: true },
      { text: "Market Intel", included: false },
      { text: "Rebalance Suggestions", included: false },
      { text: "Sentiment Index", included: false },
      { text: "New Avenues", included: false },
      { text: "Personal Advisor Support", included: false },
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 1299,
    annualPrice: 12999,
    description: "For active investors optimizing returns",
    popular: true,
    features: [
      { text: "Everything in Basic", included: true },
      { text: "Full Smart Advisor (unlimited)", included: true },
      { text: "Market Intel", included: true },
      { text: "Rebalance Suggestions", included: true },
      { text: "Sentiment Index", included: false },
      { text: "New Avenues", included: false },
      { text: "Personal Advisor Support", included: false },
    ],
  },
  {
    name: "Premium",
    monthlyPrice: 7499,
    annualPrice: 74999,
    description: "For serious investors who want it all",
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Sentiment Index", included: true },
      { text: "New Avenues", included: true },
      { text: "Personal Advisor Support", included: true },
      { text: "Early access to new features", included: true },
    ],
  },
];

const FAQ = [
  {
    q: "What happens after the 14-day trial?",
    a: "You\u2019ll be charged for the selected plan. Downgrade or cancel anytime before the trial ends.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes, upgrade or downgrade at any time. Changes take effect on your next billing cycle.",
  },
  {
    q: "How does billing work?",
    a: "Monthly plans bill every 30 days. Annual plans bill once per year at a 17% discount.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, and net banking via Razorpay.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel from your account settings. You\u2019ll retain access until the end of your billing period.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN").format(amount);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* ---- Header ---- */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-heading font-extrabold mb-3">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>

      {/* ---- Billing Toggle ---- */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-navy-900 p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              billing === "monthly"
                ? "bg-brand-lime text-brand-black"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              billing === "annual"
                ? "bg-brand-lime text-brand-black"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Annual
            <span className="rounded-full bg-brand-lime/20 text-brand-lime text-xs font-semibold px-2 py-0.5">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* ---- Pricing Cards ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {TIERS.map((tier) => (
          <div key={tier.name} className={`flex ${tier.popular ? "lg:-my-4" : ""}`}>
          <Card
            className={`relative flex flex-col w-full ${
              tier.popular
                ? "border-brand-lime ring-2 ring-brand-lime"
                : ""
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-lime text-brand-black text-xs font-bold px-3 py-1 rounded-full">
                ★ Most Popular
              </span>
            )}

            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 text-center">
              {tier.name}
            </h2>

            {/* Price */}
            <div className="mb-1 text-center">
              <span className="text-4xl font-heading font-extrabold">
                ₹{formatPrice(billing === "monthly" ? tier.monthlyPrice : tier.annualPrice)}
              </span>
              <span className="text-base text-gray-400 ml-1">
                {billing === "monthly" ? "/month" : "/year"}
              </span>
            </div>

            {billing === "annual" && (
              <p className="text-sm text-brand-lime mb-4 text-center">
                Save 17% vs monthly
              </p>
            )}
            {billing === "monthly" && (
              <p className="text-sm text-gray-400 mb-4 text-center">
                ₹{formatPrice(tier.annualPrice)}/year (save 17%)
              </p>
            )}

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
              {tier.description}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm">
                  {f.included ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-brand-lime" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 shrink-0 text-gray-300 dark:text-gray-600" />
                  )}
                  <span
                    className={
                      f.included
                        ? ""
                        : "text-gray-300 dark:text-gray-600 line-through"
                    }
                  >
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant={tier.popular ? "primary" : "outline"}
              size="lg"
              className="w-full"
              onClick={() =>
                toast.success("Trial signup coming soon!")
              }
            >
              Start Free Trial
            </Button>
          </Card>
          </div>
        ))}
      </div>

      {/* ---- Trust Note ---- */}
      <p className="text-center text-sm text-gray-400 mb-16">
        No credit card required for trial
      </p>

      {/* ---- FAQ ---- */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-heading font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-navy-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
              >
                {item.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
