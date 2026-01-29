import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  TrendingUp,
  Landmark,
  Target,
  Bitcoin,
  BarChart3,
  Search,
  Shield,
  PieChart,
  LineChart,
  Wallet,
  Brain,
  Globe,
} from "lucide-react";

const solutions = [
  {
    id: "wealth-management",
    icon: TrendingUp,
    title: "Wealth Management",
    subtitle: "Holistic Portfolio Oversight",
    description: "Get a complete, real-time view of your entire wealth — equities, mutual funds, crypto, gold, and alternative assets — aggregated from all your brokers into a single intelligent dashboard. Our AI continuously monitors your portfolio health, flags concentration risks, and ensures your wealth is growing in alignment with your goals.",
    highlights: [
      { label: "Unified Dashboard", desc: "All asset classes in one view with live valuations" },
      { label: "Net Worth Tracking", desc: "Track total wealth across brokers, banks, and wallets" },
      { label: "AI Health Score", desc: "Continuous portfolio health monitoring with alerts" },
      { label: "Performance Attribution", desc: "Understand which holdings drive your returns" },
    ],
  },
  {
    id: "retirement-planning",
    icon: Landmark,
    title: "Retirement Planning",
    subtitle: "Build Your Future, Confidently",
    description: "Plan your retirement with precision. Input your target retirement age, desired monthly income, and current savings — our engine calculates the gap, models multiple scenarios, and recommends the optimal asset allocation to get you there. Factor in inflation, tax implications, and risk tolerance for a realistic plan.",
    highlights: [
      { label: "Gap Analysis", desc: "See exactly how much more you need to save" },
      { label: "Scenario Modeling", desc: "Conservative, moderate, and aggressive projections" },
      { label: "Inflation Adjusted", desc: "All projections account for real purchasing power" },
      { label: "SIP Recommendations", desc: "Monthly investment suggestions to meet your target" },
    ],
  },
  {
    id: "goal-based-investing",
    icon: Target,
    title: "Goal-Based Investing",
    subtitle: "Every Goal Deserves a Plan",
    description: "Whether you're saving for a home (5 years), your child's education (15 years), or a world trip (2 years), each goal gets its own dedicated portfolio strategy. Our Smart Advisor tailors asset allocation by time horizon and priority, then tracks progress and adjusts recommendations as markets move.",
    highlights: [
      { label: "Multiple Goals", desc: "Create and track unlimited financial goals" },
      { label: "Time-Horizon Matching", desc: "Asset allocation matched to each goal's timeline" },
      { label: "Progress Tracking", desc: "Visual progress bars with milestone alerts" },
      { label: "Auto-Adjust", desc: "Recommendations adapt as goals approach" },
    ],
  },
  {
    id: "crypto-tracking",
    icon: Bitcoin,
    title: "Crypto Tracking",
    subtitle: "Digital Assets, Demystified",
    description: "Connect your CoinDCX, Binance, or WazirX accounts via read-only API keys and see your crypto portfolio alongside traditional assets. Track Bitcoin, Ethereum, altcoins, and DeFi positions with real-time prices, 24/7 market data, and volatility alerts tailored to your risk profile.",
    highlights: [
      { label: "Multi-Exchange", desc: "CoinDCX, Binance, WazirX, and more" },
      { label: "Real-Time Prices", desc: "24/7 live pricing across all tokens" },
      { label: "Volatility Alerts", desc: "Get notified when holdings swing beyond threshold" },
      { label: "Tax-Ready Reports", desc: "Export transaction history for tax filing" },
    ],
  },
  {
    id: "mutual-fund-analysis",
    icon: BarChart3,
    title: "Mutual Fund Analysis",
    subtitle: "Beyond Star Ratings",
    description: "Go deeper than Morningstar ratings. Analyze your mutual fund holdings with metrics that matter — rolling returns, alpha generation, expense ratios, portfolio overlap detection, and category comparison. Identify underperforming funds and discover better alternatives matched to your risk profile.",
    highlights: [
      { label: "Rolling Returns", desc: "1Y, 3Y, 5Y performance across market cycles" },
      { label: "Overlap Detection", desc: "Find hidden duplication across your MF portfolio" },
      { label: "Expense Analysis", desc: "Impact of TER on long-term wealth creation" },
      { label: "Switch Suggestions", desc: "AI-recommended alternatives for underperformers" },
    ],
  },
  {
    id: "equity-research",
    icon: Search,
    title: "Equity Research",
    subtitle: "Institutional Intelligence, Personalized",
    description: "Access consensus target prices from top brokerages, our proprietary Invest.me valuation targets, and curated research reports — all filtered by your holdings. Compare current price vs. target, see upside/downside potential, and download detailed PDF reports to make informed buy/sell decisions.",
    highlights: [
      { label: "Consensus Targets", desc: "Aggregated price targets from top analysts" },
      { label: "Invest.me Targets", desc: "Our proprietary valuation with methodology" },
      { label: "Sector Analysis", desc: "Macro trends and sector rotation insights" },
      { label: "PDF Reports", desc: "Downloadable research with detailed analysis" },
    ],
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 pt-36 pb-20 text-center">
          <span className="inline-block px-5 py-2 rounded-full border border-white/15 text-brand-lime text-xs font-semibold tracking-wider uppercase mb-8">
            Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Tailored Solutions for Every Investor
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re planning retirement, tracking crypto, or optimizing mutual funds — we have a solution built for your specific financial journey.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <section className="bg-white border-b border-gray-100 sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {solutions.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap flex-shrink-0"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="space-y-32">
            {solutions.map((solution, idx) => (
              <div key={solution.id} id={solution.id} className="scroll-mt-32">
                <div className={`grid lg:grid-cols-2 gap-16 items-start ${idx % 2 === 1 ? "" : ""}`}>
                  {/* Text side */}
                  <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                      <solution.icon className="w-7 h-7 text-brand-lime" />
                    </div>
                    <p className="text-sm font-semibold text-brand-lime uppercase tracking-wider mb-2">
                      {solution.subtitle}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight">
                      {solution.title}
                    </h2>
                    <p className="text-gray-500 text-[1.05rem] leading-relaxed mb-8">
                      {solution.description}
                    </p>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition"
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Highlights grid */}
                  <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="grid grid-cols-2 gap-4">
                      {solution.highlights.map((h) => (
                        <div
                          key={h.label}
                          className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                        >
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">{h.label}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-white mb-5 tracking-tight">
            Find the Right Solution for You
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8 text-[1.05rem] leading-relaxed">
            Every investor is different. Sign up and our AI will recommend the right combination of tools for your goals.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition shadow-lg shadow-brand-lime/20"
          >
            Start Building Wealth
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
