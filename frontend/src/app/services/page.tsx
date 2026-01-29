import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  PieChart,
  Brain,
  Target,
  LineChart,
  RefreshCw,
  Link2,
} from "lucide-react";

const services = [
  {
    id: "portfolio-tracking",
    icon: PieChart,
    title: "Portfolio Tracking",
    subtitle: "Your Complete Financial Picture",
    description: "Aggregate all your investments — equities from Zerodha, mutual funds from Groww, crypto from CoinDCX, and gold — into a single, unified dashboard. See your true net worth, asset allocation breakdown, and performance metrics in real time.",
    features: [
      "Unified net worth across all asset classes",
      "Real-time price updates and P&L tracking",
      "Asset allocation donut chart with drill-down",
      "Historical performance vs. invested amount",
      "Top movers — biggest gainers and losers today",
    ],
  },
  {
    id: "smart-advisor",
    icon: Brain,
    title: "Smart Advisor",
    subtitle: "AI That Watches Your Back",
    description: "Our three-pane Smart Advisor continuously monitors your portfolio against market events, macro trends, and your risk profile. It delivers red flags, macro intelligence, and optimization suggestions — so you never miss a critical signal.",
    features: [
      "Red Flag alerts for holdings with negative events",
      "Macro intelligence feed tagged to your portfolio",
      "Optimization suggestions based on your risk score",
      "Scenario-based \"what if\" portfolio modeling",
      "Personalized buy/sell/hold recommendations",
    ],
  },
  {
    id: "risk-profiling",
    icon: Target,
    title: "Risk Profiling",
    subtitle: "Know Your True Risk Appetite",
    description: "Our Holistic Assessment goes beyond asking \"What is your risk appetite?\" Through scenario-based questions about your demographics, financials, and behavioral preferences, we calculate a precise Risk Score and assign an investor persona.",
    features: [
      "Multi-step wizard with scenario-based questions",
      "Risk Score from 1-10 with persona assignment",
      "Considers age, income, liabilities, and goals",
      "Dynamic recalibration as your situation changes",
      "Personas: Conservative Preserver to Aggressive Growth Seeker",
    ],
  },
  {
    id: "market-intelligence",
    icon: LineChart,
    title: "Market Intelligence",
    subtitle: "Institutional-Grade Research, Simplified",
    description: "Access aggregated target prices from top analysts, curated financial news tagged to your holdings, and proprietary Invest.me valuation targets. Download detailed PDF reports and compare consensus vs. our own research.",
    features: [
      "Consensus target prices from top brokerages",
      "Proprietary Invest.me valuation targets",
      "News feed filtered by your portfolio holdings",
      "Downloadable PDF research reports",
      "Upside/downside percentage at a glance",
    ],
  },
  {
    id: "rebalancing",
    icon: RefreshCw,
    title: "Rebalancing Tools",
    subtitle: "Optimize Your Allocation",
    description: "Visualize your current allocation vs. your ideal allocation based on your risk profile and goals. Our AI generates specific sell/buy suggestions to bring your portfolio back into alignment — with a clear before-and-after preview.",
    features: [
      "Before vs. After allocation visualization",
      "Slider interface for manual adjustment",
      "AI-generated sell/buy suggestions",
      "Goal-based rebalancing recommendations",
      "New Avenues Explorer for discovery",
    ],
  },
  {
    id: "broker-integration",
    icon: Link2,
    title: "Broker Integration",
    subtitle: "Connect Everything Seamlessly",
    description: "Connect your brokerage accounts via API or import your tradebooks via CSV. We support Zerodha (Kite Connect), Upstox, CoinDCX, Binance, and more. Your data syncs automatically so your portfolio is always up to date.",
    features: [
      "Zerodha & Upstox API integration",
      "CoinDCX & Binance read-only API keys",
      "CSV import for standard tradebook formats",
      "Automatic daily sync and price refresh",
      "Manual entry for unlisted or alternative assets",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 pt-36 pb-20 text-center">
          <span className="inline-block px-5 py-2 rounded-full border border-white/15 text-brand-lime text-xs font-semibold tracking-wider uppercase mb-8">
            Our Services
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Everything You Need to Invest Smarter
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            From portfolio aggregation to AI-driven advisory — six powerful capabilities designed for the modern Indian investor.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="space-y-32">
            {services.map((service, idx) => (
              <div key={service.id} id={service.id} className="scroll-mt-24">
                <div className={`grid lg:grid-cols-2 gap-16 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  {/* Text side */}
                  <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                      <service.icon className="w-7 h-7 text-brand-lime" />
                    </div>
                    <p className="text-sm font-semibold text-brand-lime uppercase tracking-wider mb-2">{service.subtitle}</p>
                    <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight">{service.title}</h2>
                    <p className="text-gray-500 text-[1.05rem] leading-relaxed mb-8">{service.description}</p>
                    <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Features side */}
                  <div className={`bg-gray-50 rounded-4xl p-10 border border-gray-100 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Key Features</h3>
                    <ul className="space-y-4">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-brand-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-brand-lime" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          </div>
                          <span className="text-gray-600 text-[0.95rem] leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
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
            Ready to Experience All Six?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8 text-[1.05rem] leading-relaxed">
            Sign up for free and connect your first broker in under 2 minutes.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition shadow-lg shadow-brand-lime/20">
            Start Building Wealth
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
