"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  PieChart,
  Shield,
  Brain,
  Newspaper,
  Activity,
  BarChart3,
  Zap,
  Globe,
  MessageSquare,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Slide data                                                         */
/* ------------------------------------------------------------------ */

const SLIDES = [
  {
    key: "portfolio",
    icon: <PieChart className="w-8 h-8 text-brand-lime" />,
    title: "Track Your Portfolio",
    subtitle: "See all your investments in one place — equities, mutual funds, gold, crypto, and more.",
  },
  {
    key: "advisor",
    icon: <Brain className="w-8 h-8 text-brand-lime" />,
    title: "Smart Advisor",
    subtitle: "Get AI-powered investment recommendations, rebalancing alerts, and portfolio health checks.",
  },
  {
    key: "intel",
    icon: <Newspaper className="w-8 h-8 text-brand-lime" />,
    title: "Market Intelligence",
    subtitle: "Real-time news, sector analysis, and expert insights to keep you ahead of the market.",
  },
  {
    key: "sentiment",
    icon: <Activity className="w-8 h-8 text-brand-lime" />,
    title: "Sentiment Index",
    subtitle: "Gauge real-time market mood from news and social signals before making your next move.",
  },
  {
    key: "avenues",
    icon: <Rocket className="w-8 h-8 text-brand-lime" />,
    title: "New Avenues",
    subtitle: "Discover AI-curated IPOs, new fund launches, and alternative investment opportunities before the crowd.",
  },
];

/* ------------------------------------------------------------------ */
/*  Glass card component                                               */
/* ------------------------------------------------------------------ */

const glass = "bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl";

/* ------------------------------------------------------------------ */
/*  Per-slide pictorial cards                                          */
/* ------------------------------------------------------------------ */

function PortfolioCards() {
  return (
    <div className="relative w-full h-[400px]">
      {/* Card 1: Portfolio Value — top-right */}
      <div className={`absolute top-0 right-0 p-5 w-72 z-10 ${glass}`}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Portfolio Value</p>
          <PieChart className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-white/10" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="8" />
              <circle className="text-brand-lime" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213.6" strokeDashoffset="60" strokeWidth="8" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[10px] text-gray-400 leading-none">Equity</span>
              <span className="text-xs font-bold text-white">72%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-white leading-tight">&#8377; 24,50,000</p>
            <p className="text-[10px] text-gray-400 mb-2">Total invested</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
              <span className="text-[9px] text-gray-300">Equity &amp; MFs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-[9px] text-gray-300">Gold &amp; FDs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Top Holdings — middle-left */}
      <div className={`absolute top-24 left-0 p-5 w-64 z-20 ${glass}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Top Holdings</p>
            <h3 className="text-xl font-bold text-white mt-1">&#8377; 8,42,000</h3>
          </div>
          <span className="text-[10px] bg-brand-lime/20 text-brand-lime px-2 py-0.5 rounded-full font-bold">&uarr; 18.4%</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">Reliance Industries</span>
            <span className="text-white font-medium">&#8377; 4,13,800</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">HDFC Bank</span>
            <span className="text-white font-medium">&#8377; 2,56,200</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">TCS</span>
            <span className="text-white font-medium">&#8377; 1,72,000</span>
          </div>
        </div>
      </div>

      {/* Card 3: Performance — bottom-right */}
      <div className={`absolute bottom-0 right-4 p-5 w-60 z-30 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Performance</p>
        <div className="flex items-end gap-1 h-16 mb-2">
          {[40, 55, 45, 65, 50, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-lime/30 rounded-sm" style={{ height: `${h}%` }}>
              <div className="w-full bg-brand-lime rounded-sm" style={{ height: "60%" }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-400">1Y return</span>
          <span className="text-brand-lime font-bold">+24.6%</span>
        </div>
      </div>
    </div>
  );
}

function AdvisorCards() {
  return (
    <div className="relative w-full h-[400px]">
      {/* Card 1: Rebalance Alert */}
      <div className={`absolute top-0 right-0 p-5 w-72 z-10 ${glass}`}>
        <div className="mb-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Smart Advisor</p>
          <p className="text-sm font-bold text-white">Rebalance Alert</p>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="text-gray-400">Risk alignment</span>
              <span className="text-brand-lime font-bold">86%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="bg-brand-lime h-full w-[86%]" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-400">Suggested action</p>
              <p className="text-sm font-bold text-white">Move 8% to debt</p>
            </div>
            <Shield className="w-4 h-4 text-brand-lime" />
          </div>
        </div>
      </div>

      {/* Card 2: AI Queries */}
      <div className={`absolute top-24 left-0 p-5 w-64 z-20 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">AI Chat</p>
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[11px] text-gray-300">&ldquo;Should I increase my SIP in Nifty 50?&rdquo;</p>
          </div>
          <div className="bg-brand-lime/10 rounded-lg p-3 border border-brand-lime/20">
            <p className="text-[11px] text-brand-lime font-medium">Based on your risk profile, a 15% SIP increase aligns with your goals.</p>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] text-gray-500">Unlimited queries with Pro</span>
          </div>
        </div>
      </div>

      {/* Card 3: Health Score */}
      <div className={`absolute bottom-0 right-4 p-5 w-60 z-30 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Portfolio Health</p>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-white/10" cx="32" cy="32" fill="transparent" r="26" stroke="currentColor" strokeWidth="6" />
              <circle className="text-brand-lime" cx="32" cy="32" fill="transparent" r="26" stroke="currentColor" strokeDasharray="163.4" strokeDashoffset="24" strokeWidth="6" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">85</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Strong</p>
            <p className="text-[10px] text-gray-400">Well diversified</p>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-brand-lime" />
              <span className="text-[10px] text-brand-lime font-medium">2 suggestions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketIntelCards() {
  return (
    <div className="relative w-full h-[400px]">
      {/* Card 1: Breaking News */}
      <div className={`absolute top-0 right-0 p-5 w-72 z-10 ${glass}`}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-brand-lime" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Market News</p>
        </div>
        <div className="space-y-3">
          <div className="border-b border-white/5 pb-3">
            <p className="text-[11px] text-white font-medium mb-1">RBI keeps repo rate unchanged at 6.5%</p>
            <p className="text-[10px] text-gray-500">2 hours ago &bull; Banking sector</p>
          </div>
          <div className="border-b border-white/5 pb-3">
            <p className="text-[11px] text-white font-medium mb-1">IT sector Q3 results beat estimates</p>
            <p className="text-[10px] text-gray-500">5 hours ago &bull; Technology</p>
          </div>
          <div>
            <p className="text-[11px] text-white font-medium mb-1">Gold hits all-time high amid global uncertainty</p>
            <p className="text-[10px] text-gray-500">8 hours ago &bull; Commodities</p>
          </div>
        </div>
      </div>

      {/* Card 2: Sector Performance */}
      <div className={`absolute top-24 left-0 p-5 w-64 z-20 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Sector Heatmap</p>
        <div className="space-y-2">
          {[
            { name: "Banking", pct: "+1.8%", up: true, w: "75%" },
            { name: "IT", pct: "+2.4%", up: true, w: "85%" },
            { name: "Pharma", pct: "-0.6%", up: false, w: "30%" },
            { name: "Auto", pct: "+0.9%", up: true, w: "55%" },
            { name: "FMCG", pct: "-0.3%", up: false, w: "25%" },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-300 w-14">{s.name}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.up ? "bg-brand-lime" : "bg-alert-red/60"}`} style={{ width: s.w }} />
              </div>
              <span className={`text-[10px] font-bold ${s.up ? "text-brand-lime" : "text-alert-red"}`}>{s.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Analyst Picks */}
      <div className={`absolute bottom-0 right-4 p-5 w-60 z-30 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Analyst Picks</p>
        <div className="space-y-2.5">
          {[
            { sym: "HDFCBANK", target: "1,920", rating: "Buy" },
            { sym: "INFY", target: "1,850", rating: "Buy" },
            { sym: "RELIANCE", target: "1,580", rating: "Hold" },
          ].map((p) => (
            <div key={p.sym} className="flex justify-between items-center">
              <span className="text-[11px] text-white font-medium">{p.sym}</span>
              <div className="text-right">
                <span className="text-[10px] text-gray-400">&#8377; {p.target}</span>
                <span className={`text-[9px] ml-2 px-1.5 py-0.5 rounded font-bold ${p.rating === "Buy" ? "bg-brand-lime/20 text-brand-lime" : "bg-white/10 text-gray-300"}`}>
                  {p.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentimentCards() {
  return (
    <div className="relative w-full h-[400px]">
      {/* Card 1: Sentiment Gauge */}
      <div className={`absolute top-0 right-0 p-5 w-72 z-10 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Market Sentiment</p>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-12 overflow-hidden">
            {/* Semi-circle gauge */}
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#D4F358" strokeWidth="8" strokeLinecap="round" strokeDasharray="126" strokeDashoffset="38" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">70</p>
            <p className="text-[10px] text-brand-lime font-semibold">Bullish</p>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-[9px] text-gray-500">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>

      {/* Card 2: Trending Signals */}
      <div className={`absolute top-24 left-0 p-5 w-64 z-20 ${glass}`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Trending Signals</p>
        <div className="space-y-3">
          {[
            { name: "Nifty 50", val: "22,450", up: true, chg: "+1.2%" },
            { name: "Sensex", val: "73,800", up: true, chg: "+0.9%" },
            { name: "Bank Nifty", val: "48,200", up: false, chg: "-0.4%" },
          ].map((s) => (
            <div key={s.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {s.up ? (
                  <ArrowUpRight className="w-3 h-3 text-brand-lime" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-alert-red" />
                )}
                <span className="text-[11px] text-white">{s.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-white font-medium">{s.val}</span>
                <span className={`text-[10px] ml-2 font-bold ${s.up ? "text-brand-lime" : "text-alert-red"}`}>{s.chg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Social Buzz */}
      <div className={`absolute bottom-0 right-4 p-5 w-60 z-30 ${glass}`}>
        <div className="flex items-center gap-2 mb-3">
          <LineChart className="w-3.5 h-3.5 text-brand-lime" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Social Buzz</p>
        </div>
        <div className="space-y-2">
          {[
            { tag: "#NiftyBreakout", vol: "12.4K mentions" },
            { tag: "#GoldRally", vol: "8.1K mentions" },
            { tag: "#ITEarnings", vol: "6.7K mentions" },
          ].map((t) => (
            <div key={t.tag} className="flex justify-between items-center">
              <span className="text-[11px] text-brand-lime font-medium">{t.tag}</span>
              <span className="text-[10px] text-gray-500">{t.vol}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewAvenuesCards() {
  return (
    <div className="relative w-full h-[400px]">
      {/* Card 1: Upcoming IPOs */}
      <div className={`absolute top-0 right-0 p-5 w-72 z-10 ${glass}`}>
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-4 h-4 text-brand-lime" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Upcoming IPOs</p>
        </div>
        <div className="space-y-3">
          {[
            { name: "GreenEnergy Solar", date: "Feb 12", size: "₹ 2,400 Cr", rating: "Subscribe" },
            { name: "QuickCart Logistics", date: "Feb 18", size: "₹ 890 Cr", rating: "Neutral" },
            { name: "NeoBank Finance", date: "Mar 03", size: "₹ 5,100 Cr", rating: "Subscribe" },
          ].map((ipo) => (
            <div key={ipo.name} className="flex justify-between items-center">
              <div>
                <p className="text-[11px] text-white font-medium">{ipo.name}</p>
                <p className="text-[9px] text-gray-500">{ipo.date} &bull; {ipo.size}</p>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${ipo.rating === "Subscribe" ? "bg-brand-lime/20 text-brand-lime" : "bg-white/10 text-gray-300"}`}>
                {ipo.rating}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: New Fund Launches */}
      <div className={`absolute top-24 left-0 p-5 w-64 z-20 ${glass}`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">New Funds</p>
        </div>
        <div className="space-y-3">
          {[
            { name: "Axis AI & Tech Fund", cat: "Sectoral", ret: "New" },
            { name: "HDFC Green Energy", cat: "Thematic", ret: "New" },
            { name: "SBI Digital India", cat: "Sectoral", ret: "New" },
          ].map((f) => (
            <div key={f.name} className="flex justify-between items-center">
              <div>
                <p className="text-[11px] text-white font-medium">{f.name}</p>
                <p className="text-[9px] text-gray-500">{f.cat}</p>
              </div>
              <span className="text-[9px] bg-brand-lime/20 text-brand-lime px-1.5 py-0.5 rounded font-bold">{f.ret}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Alternative Investments */}
      <div className={`absolute bottom-0 right-4 p-5 w-60 z-30 ${glass}`}>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-3.5 h-3.5 text-brand-lime" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Alternatives</p>
        </div>
        <div className="space-y-2.5">
          {[
            { name: "Sovereign Gold Bond", yield: "2.5% + gold" },
            { name: "REITs — Embassy Office", yield: "6.8% yield" },
            { name: "Invoice Discounting", yield: "9.2% p.a." },
          ].map((a) => (
            <div key={a.name} className="flex justify-between items-center">
              <span className="text-[11px] text-white font-medium">{a.name}</span>
              <span className="text-[10px] text-brand-lime font-bold">{a.yield}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SLIDE_CARDS = [PortfolioCards, AdvisorCards, MarketIntelCards, SentimentCards, NewAvenuesCards];

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[active];
  const Cards = SLIDE_CARDS[active];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black p-4 lg:p-8">
      <div className="max-w-[1440px] w-full bg-white dark:bg-navy-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[850px] border border-gray-100 dark:border-white/5">
        {/* ---- Left: Form Panel ---- */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-between bg-white dark:bg-navy-800">
          <div>
            <div className="flex items-center gap-2 mb-16">
              <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-black" />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight text-gray-900 dark:text-white">
                Invest<span className="text-brand-lime">.me</span>
              </span>
            </div>
            <div className="max-w-md mx-auto w-full">
              {children}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-12 gap-4">
            <p>&copy; {new Date().getFullYear()} Invest.me. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-brand-lime transition-colors">Terms &amp; Conditions</a>
              <a href="#" className="hover:text-brand-lime transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* ---- Right: Showcase Panel ---- */}
        <div className="hidden md:flex w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-black flex-col justify-center items-center p-8 lg:p-16">
          {/* Line grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212, 243, 88, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 243, 88, 0.12) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-lime/8 blur-[120px] pointer-events-none rounded-full" />

          {/* Slide cards */}
          <div className="relative z-10 w-full mb-12">
            <Cards />
          </div>

          {/* Tagline */}
          <div className="text-center max-w-lg z-10 relative">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-white/10">
              {slide.icon}
            </div>
            <h2 className="text-3xl font-heading font-bold text-white mb-4 leading-tight">
              {slide.title}
            </h2>
            <p className="text-gray-400 leading-relaxed text-sm mb-10">
              {slide.subtitle}
            </p>

            {/* Pagination dots */}
            <div className="flex justify-center gap-3">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all ${
                    i === active
                      ? "h-2.5 w-14 bg-brand-lime"
                      : "h-2.5 w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
