import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Home as HomeIcon,
  Layers,
  Grid3X3,
  Briefcase,
  Globe,
  BarChart3,
  Lock,
  Brain,
  LineChart,
  PieChart,
  Target,
  Smartphone,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HERO: Wealth Growth Dashboard Visual (Scaled up)
   ───────────────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative w-full h-[540px] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute w-80 h-80 rounded-full bg-brand-lime/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute w-56 h-56 rounded-full bg-cyan-500/8 blur-[90px] translate-x-20 -translate-y-10" />

      {/* Main card — Portfolio dashboard mockup */}
      <div className="animate-float">
        <div className="w-[370px] rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
          <div className="relative bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 p-7 pb-6">
            <div className="absolute inset-0 card-shine rounded-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1">Total Portfolio</p>
                <p className="text-[2rem] font-semibold text-white tracking-tight">&#8377;24,85,400</p>
              </div>
              <div className="px-3.5 py-2 rounded-full bg-brand-lime/15 border border-brand-lime/30">
                <span className="text-brand-lime text-sm font-semibold">+18.2%</span>
              </div>
            </div>

            {/* Mini chart — SVG growth line */}
            <div className="relative z-10 mb-6">
              <svg viewBox="0 0 320 90" className="w-full h-auto" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4F358" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#D4F358" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,72 C25,66 45,60 70,55 C95,50 115,57 140,46 C165,35 185,42 210,30 C235,20 255,24 280,15 C300,9 312,13 320,11 L320,90 L0,90 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,72 C25,66 45,60 70,55 C95,50 115,57 140,46 C165,35 185,42 210,30 C235,20 255,24 280,15 C300,9 312,13 320,11"
                  fill="none"
                  stroke="#D4F358"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="320" cy="11" r="4.5" fill="#D4F358" />
                <circle cx="320" cy="11" r="8" fill="#D4F358" opacity="0.3" />
              </svg>
            </div>

            {/* Allocation bars */}
            <div className="relative z-10 space-y-3">
              {[
                { label: "Equities", pct: 52, color: "bg-brand-lime" },
                { label: "Mutual Funds", pct: 28, color: "bg-emerald-400" },
                { label: "Crypto", pct: 12, color: "bg-cyan-400" },
                { label: "Gold", pct: 8, color: "bg-amber-400" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/50 w-24 text-right">{a.label}</span>
                  <div className="flex-1 h-[7px] rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
                  </div>
                  <span className="text-[11px] text-white/60 font-medium w-9">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating signal card — Smart Alert */}
      <div className="absolute top-4 right-0 glass-card rounded-2xl px-5 py-4 z-20 animate-fade-in delay-500">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-lime" />
          <span className="text-[12px] text-white/60 font-medium tracking-wide uppercase">Smart Signal</span>
        </div>
        <p className="text-[13px] text-white/80 leading-snug font-medium">
          NIFTY 50 up 1.2%
          <br />
          Portfolio aligned
        </p>
      </div>

      {/* Floating card — Top Holdings */}
      <div className="absolute -bottom-4 -left-6 animate-float-second">
        <div className="w-[240px] rounded-2xl overflow-hidden shadow-xl shadow-black/30 border border-white/8">
          <div className="relative bg-gradient-to-br from-[#1a3a4a] via-navy-800 to-[#0a1520] p-5">
            <div className="absolute inset-0 card-shine rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[11px] text-white/40 uppercase tracking-widest mb-3">Top Holdings</p>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-lime/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brand-lime" />
                </div>
                <div>
                  <p className="text-[13px] text-white font-semibold">HDFC Bank</p>
                  <p className="text-[11px] text-emerald-400 font-medium">+12.4%</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[13px] text-white font-semibold">Reliance Ind.</p>
                  <p className="text-[11px] text-emerald-400 font-medium">+8.7%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat badge */}
      <div className="absolute bottom-20 right-0 glass-card rounded-2xl px-5 py-3.5 z-20 animate-fade-in delay-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-lime/20 flex items-center justify-center">
            <ArrowUpRight className="w-4.5 h-4.5 text-brand-lime" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">+24.5%</p>
            <p className="text-[11px] text-white/50">CAGR (3Y)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MISSION: Rich Visual Cards
   ───────────────────────────────────────────── */
function SecureWealthVisual() {
  return (
    <div className="relative w-full h-[220px] mb-8 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
        backgroundSize: "16px 16px"
      }} />

      {/* Central shield with surrounding elements */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
          {/* Inner ring */}
          <div className="w-28 h-28 rounded-full border border-gray-200/60 flex items-center justify-center">
            {/* Shield icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-white to-gray-50 shadow-lg shadow-gray-200/60 flex items-center justify-center border border-gray-200/80">
              <Shield className="w-10 h-10 text-gray-400 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Floating elements around the shield */}
        <div className="absolute -top-2 right-2 w-10 h-10 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="absolute -bottom-1 -left-3 w-10 h-10 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div className="absolute top-1/2 -right-6 -translate-y-1/2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] font-semibold text-emerald-600">256-bit</span>
        </div>
        <div className="absolute -top-3 -left-4 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-[10px] font-semibold text-blue-600">AES</span>
        </div>

        {/* Clay dots */}
        <div className="absolute -top-4 left-1/2 w-3 h-3 rounded-full bg-gray-200/80" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-gray-200/80" />
        <div className="absolute top-6 -left-6 w-2 h-2 rounded-full bg-gray-200/80" />
      </div>
    </div>
  );
}

function AIInsightsVisual() {
  return (
    <div className="relative w-full h-[220px] mb-8 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
        backgroundSize: "16px 16px"
      }} />

      <div className="relative">
        {/* Outer ring */}
        <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
          {/* Inner ring */}
          <div className="w-28 h-28 rounded-full border border-gray-200/60 flex items-center justify-center">
            {/* Brain icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-white to-gray-50 shadow-lg shadow-gray-200/60 flex items-center justify-center border border-gray-200/80">
              <Brain className="w-10 h-10 text-gray-400 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Floating signal cards */}
        <div className="absolute -top-3 right-0 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 shadow-sm">
          <span className="text-[10px] font-semibold text-red-600">Red Flag</span>
        </div>
        <div className="absolute -bottom-2 -left-4 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-semibold text-emerald-600">Buy Signal</span>
        </div>
        <div className="absolute top-1/2 -right-8 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 shadow-sm">
          <span className="text-[10px] font-semibold text-amber-600">Macro Alert</span>
        </div>
        <div className="absolute -top-4 -left-3 w-9 h-9 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <LineChart className="w-4.5 h-4.5 text-gray-400" />
        </div>
        <div className="absolute bottom-4 right-0 w-9 h-9 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <TrendingUp className="w-4.5 h-4.5 text-gray-400" />
        </div>

        {/* Clay dots */}
        <div className="absolute -top-5 left-1/3 w-3 h-3 rounded-full bg-gray-200/80" />
        <div className="absolute bottom-1 -right-2 w-2 h-2 rounded-full bg-gray-200/80" />
        <div className="absolute top-8 -left-7 w-2.5 h-2.5 rounded-full bg-gray-200/80" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BENTO: Illustrations
   ───────────────────────────────────────────── */
function SmartSignalsIllustration() {
  const signals = [
    { icon: "🔴", title: "Adani Ent.", msg: "Hindenburg exposure detected", severity: "High Risk", color: "border-red-200 bg-red-50" },
    { icon: "🟢", title: "HDFC Bank", msg: "Undervalued by 12% vs target", severity: "Buy Signal", color: "border-emerald-200 bg-emerald-50" },
    { icon: "🟡", title: "RBI Policy", msg: "Rate cut expected — bonds rally", severity: "Watch", color: "border-amber-200 bg-amber-50" },
  ];
  return (
    <div className="h-56 bg-gray-50 rounded-t-3xl p-5 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }} />
      <div className="space-y-2 relative z-10">
        {signals.map((s) => (
          <div key={s.title} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${s.color}`}>
            <span className="text-sm">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-800 truncate">{s.title}</p>
              <p className="text-[10px] text-gray-500 truncate">{s.msg}</p>
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide flex-shrink-0">{s.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioAllocationIllustration() {
  return (
    <div className="h-56 bg-gray-50 rounded-t-3xl flex items-center justify-center relative overflow-hidden">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="48" fill="none" stroke="#D4F358" strokeWidth="14"
            strokeDasharray="150.8 301.6" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="#34d399" strokeWidth="14"
            strokeDasharray="84.4 301.6" strokeDashoffset="-150.8" strokeLinecap="round" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="#22d3ee" strokeWidth="14"
            strokeDasharray="36.2 301.6" strokeDashoffset="-235.2" strokeLinecap="round" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="#fbbf24" strokeWidth="14"
            strokeDasharray="30.2 301.6" strokeDashoffset="-271.4" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] text-gray-400 font-medium">Net Worth</p>
          <p className="text-lg font-semibold text-gray-800">&#8377;24.8L</p>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
        {[
          { color: "bg-brand-lime", label: "Equity" },
          { color: "bg-emerald-400", label: "MF" },
          { color: "bg-cyan-400", label: "Crypto" },
          { color: "bg-amber-400", label: "Gold" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[9px] text-gray-500 font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskProfileIllustration() {
  return (
    <div className="h-40 bg-gray-50 rounded-t-3xl flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }} />
      <div className="text-center relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-3">
          <Target className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Risk Score: 7/10</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Aggressive Growth</p>
      </div>
    </div>
  );
}

function AnalyticsIllustration() {
  return (
    <div className="h-40 bg-gray-50 rounded-t-3xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="flex items-end gap-1.5 mb-4 h-16">
        {[28, 45, 32, 55, 42, 65, 38, 72, 50, 60].map((h, i) => (
          <div
            key={i}
            className="w-[10px] rounded-t-sm transition-all"
            style={{
              height: `${h}%`,
              backgroundColor: i === 7 ? "#D4F358" : "#d1d5db",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-lime text-navy-900 text-xs font-bold shadow-sm">
          &#8377;78L AUM
        </span>
        <span className="text-[10px] text-gray-400 font-medium">+12.4% YTD</span>
      </div>
    </div>
  );
}

function RebalanceIllustration() {
  return (
    <div className="h-40 bg-gray-50 rounded-t-3xl flex items-center justify-center px-6 relative overflow-hidden">
      <div className="relative w-full max-w-[180px]">
        <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mb-2 text-center">Rebalance Preview</p>
        <div className="space-y-2">
          {[
            { label: "Equity", before: 65, after: 52, color: "bg-brand-lime" },
            { label: "Crypto", before: 25, after: 12, color: "bg-cyan-400" },
            { label: "MF", before: 5, after: 28, color: "bg-emerald-400" },
            { label: "Gold", before: 5, after: 8, color: "bg-amber-400" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500 w-10 text-right">{r.label}</span>
              <div className="flex-1 h-[5px] rounded-full bg-gray-200 relative">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gray-300 opacity-40" style={{ width: `${r.before}%` }} />
                <div className={`absolute inset-y-0 left-0 rounded-full ${r.color}`} style={{ width: `${r.after}%` }} />
              </div>
              <span className="text-[9px] text-gray-500 font-semibold w-6">{r.after}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */
const stats = [
  { value: "200K", label: "Investors trust Invest.me to manage and grow their wealth." },
  { value: "4.9+", label: "Average rating from users who rely on our AI-driven insights daily." },
  { value: "98%", label: "Report improved investment decisions after using our Smart Advisor." },
];

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

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="min-h-screen bg-white font-body">
      {/* ════════════════ NAVBAR ════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <Link href="/" className="text-2xl font-heading font-bold text-navy-900 tracking-tight">
            <span className="text-brand-lime mr-1">&#9670;</span>
            Invest<span className="text-brand-lime">.me</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", icon: HomeIcon },
              { label: "Integrations", icon: Layers },
              { label: "Features", icon: Grid3X3 },
              { label: "Services", icon: Briefcase },
            ].map((item) => (
              <a
                key={item.label}
                href={`#${item.label.toLowerCase()}`}
                className="flex items-center gap-1.5 text-[0.95rem] font-medium text-gray-500 hover:text-navy-900 transition-colors duration-200"
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </a>
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

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden hero-gradient min-h-[100vh]">
        <div className="absolute inset-0 grid-bg" />

        <div className="relative max-w-7xl mx-auto px-8 pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <span className="inline-block px-5 py-2 rounded-full border border-white/15 text-brand-lime text-xs font-semibold tracking-wider uppercase mb-10 animate-fade-in-up">
                AI-Powered Wealth Management
              </span>

              <h1 className="text-[2.8rem] sm:text-[3.5rem] lg:text-[4.2rem] font-heading font-medium leading-[1.08] tracking-tight text-white animate-fade-in-up delay-100">
                Your Intelligent
                <br />
                Financial Advisor,
                <br />
                <span className="text-gradient font-semibold">Invest.me</span>
              </h1>

              <p className="mt-7 text-gray-400 text-[1.05rem] leading-relaxed max-w-md animate-fade-in-up delay-200">
                Aggregate your portfolio, get AI-driven Smart Signals,
                and make <strong className="text-white font-medium">data-backed investment decisions</strong> across
                equities, mutual funds, crypto, and gold.
              </p>

              <div className="mt-10 flex items-center gap-3 animate-fade-in-up delay-300">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition shadow-lg shadow-brand-lime/20"
                >
                  Start Building Wealth
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-navy-900 hover:bg-gray-100 transition shadow-lg"
                  aria-label="Get started"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right — visual */}
            <div className="hidden lg:block animate-fade-in delay-400">
              <HeroVisual />
            </div>
          </div>

          {/* Platform integrations */}
          <div className="mt-24 pt-8 border-t border-white/5 animate-fade-in delay-500">
            <p className="text-xs text-gray-500 uppercase tracking-[0.25em] font-medium mb-6">
              Integrated Platforms
            </p>
            <div className="flex items-center gap-10 sm:gap-14 flex-wrap">
              {["Zerodha", "Upstox", "Indmoney", "Groww", "CoinDCX", "Binance"].map((name) => (
                <span
                  key={name}
                  className="text-[1.4rem] sm:text-[1.6rem] font-bold tracking-tight text-white/30 hover:text-white/50 transition-colors duration-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TICKER TAPE ════════════════ */}
      <div className="bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
        <div className="ticker-scroll flex items-center gap-0 py-3">
          {[0, 1].map((set) => (
            <div key={set} className="flex items-center gap-0 flex-shrink-0 ticker-content">
              {[
                { symbol: "DJIA", price: "42,840.26", currency: "$", change: "+1.14%", up: true },
                { symbol: "S&P 500", price: "5,942.47", currency: "$", change: "+0.87%", up: true },
                { symbol: "NASDAQ", price: "19,480.91", currency: "$", change: "+1.51%", up: true },
                { symbol: "NIFTY 50", price: "24,857.30", currency: "₹", change: "+0.82%", up: true },
                { symbol: "SENSEX", price: "81,453.20", currency: "₹", change: "+0.76%", up: true },
                { symbol: "FTSE 100", price: "8,327.64", currency: "£", change: "-0.23%", up: false },
                { symbol: "DAX", price: "20,214.79", currency: "€", change: "+0.65%", up: true },
                { symbol: "NIKKEI 225", price: "39,523.55", currency: "¥", change: "+1.08%", up: true },
                { symbol: "HANG SENG", price: "20,145.30", currency: "HK$", change: "-0.47%", up: false },
                { symbol: "SHANGHAI", price: "3,244.38", currency: "¥", change: "+0.32%", up: true },
                { symbol: "GOLD", price: "2,748.60", currency: "$", change: "+0.54%", up: true },
                { symbol: "SILVER", price: "32.84", currency: "$", change: "+1.12%", up: true },
                { symbol: "CRUDE OIL", price: "76.42", currency: "$", change: "-0.68%", up: false },
                { symbol: "M2 GLOBAL", price: "108.4T", currency: "$", change: "+0.21%", up: true },
                { symbol: "US 10Y", price: "4.523%", currency: "", change: "-0.15%", up: false },
                { symbol: "DXY", price: "103.82", currency: "", change: "-0.34%", up: false },
              ].map((t) => (
                <div key={`${set}-${t.symbol}`} className="flex items-center gap-4 px-6 border-r border-white/5 last:border-r-0">
                  <span className="text-[13px] font-semibold text-white/70 tracking-wide">{t.symbol}</span>
                  <span className="text-[13px] text-white/50 font-mono">{t.currency}{t.price}</span>
                  <span className={`text-[12px] font-semibold flex items-center gap-0.5 ${t.up ? "text-emerald-400" : "text-red-400"}`}>
                    <span className="text-[10px]">{t.up ? "▲" : "▼"}</span>
                    {t.change}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ MISSION ════════════════ */}
      <section id="features" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-28">
          <span className="inline-flex items-center px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 tracking-wider uppercase mb-16">
            Our Mission
          </span>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 — Secure Your Wealth */}
            <div className="rounded-4xl border border-gray-200 p-10 pb-12 group hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
              <SecureWealthVisual />
              <h3 className="text-[1.6rem] font-heading font-medium text-gray-900 mb-3">
                Secure Your Wealth
              </h3>
              <p className="text-gray-500 leading-relaxed mb-10 max-w-sm text-[1.05rem]">
                We believe wealth creation begins with trust.
                Our platform safeguards your portfolio data with
                institutional-grade security while giving you
                complete visibility over every asset.
              </p>
              <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition group/btn">
                See Details
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Card 2 — AI-Driven Insights */}
            <div className="rounded-4xl border border-gray-200 p-10 pb-12 group hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
              <AIInsightsVisual />
              <h3 className="text-[1.6rem] font-heading font-medium text-gray-900 mb-3">
                AI-Driven Insights
              </h3>
              <p className="text-gray-500 leading-relaxed mb-10 max-w-sm text-[1.05rem]">
                Our Smart Advisor analyzes market signals,
                compares your risk profile against your holdings,
                and delivers actionable recommendations —
                so you&apos;re always one step ahead.
              </p>
              <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition group/btn">
                See Details
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-3 mt-12">
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all" aria-label="Previous">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all" aria-label="Next">
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════ BIG STATEMENT ════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 pb-24">
          <h2 className="text-[2.5rem] sm:text-[3rem] lg:text-[3.4rem] font-heading font-medium leading-[1.12] tracking-tight text-gray-900 max-w-5xl">
            One platform to track, analyze, and
            optimize your entire portfolio —{" "}
            <span className="text-gray-300">
              powered by intelligence, built for wealth.
            </span>
          </h2>
        </div>
      </section>

      {/* ════════════════ BENTO FEATURES ════════════════ */}
      <section id="services" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 pb-28">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-300 group">
              <SmartSignalsIllustration />
              <div className="p-7 pt-6">
                <h3 className="text-xl font-heading font-medium text-gray-900 mb-2.5">
                  Smart Signals & Alerts
                </h3>
                <p className="text-[0.95rem] text-gray-500 leading-relaxed">
                  Get real-time red flags, macro intelligence, and AI-generated
                  buy/sell signals tailored to your holdings. Never miss a
                  critical market move again.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-300 group">
              <PortfolioAllocationIllustration />
              <div className="p-7 pt-6">
                <h3 className="text-xl font-heading font-medium text-gray-900 mb-2.5">
                  Unified Portfolio View
                </h3>
                <p className="text-[0.95rem] text-gray-500 leading-relaxed">
                  Aggregate equities, mutual funds, crypto, and gold into a
                  single dashboard. See your true net worth and asset allocation
                  at a glance across all your brokers.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-300">
              <RiskProfileIllustration />
              <div className="p-6 pt-5">
                <h3 className="text-lg font-heading font-medium text-gray-900 mb-2">Risk Profiling</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our holistic assessment determines your true risk appetite through scenario-based questions — no jargon, just clarity on your investor persona.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-300">
              <AnalyticsIllustration />
              <div className="p-6 pt-5">
                <h3 className="text-lg font-heading font-medium text-gray-900 mb-2">Market Intelligence</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Access curated research reports, consensus target prices, and proprietary valuation analysis to make informed investment decisions.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/60 transition-all duration-300">
              <RebalanceIllustration />
              <div className="p-6 pt-5">
                <h3 className="text-lg font-heading font-medium text-gray-900 mb-2">Smart Rebalancing</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Visualize before-and-after allocation shifts. Get AI suggestions to realign your portfolio with your risk profile and financial goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIAL & STATS ════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24 border-t border-gray-100">
          <span className="inline-flex items-center px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 tracking-wider uppercase mb-14">
            Testimonial
          </span>

          <blockquote className="text-[1.5rem] sm:text-[1.8rem] lg:text-[2.2rem] font-heading font-medium leading-snug text-gray-900 max-w-4xl mb-10">
            &ldquo;I had investments scattered across Zerodha, Groww, and
            CoinDCX with no unified view. Invest.me brought everything
            together and its Smart Advisor flagged risks I would have
            completely missed. My portfolio is up 22% since I started.&rdquo;
          </blockquote>
          <p className="text-sm text-gray-500 mb-20">
            Testimonial From{" "}
            <span className="font-bold text-brand-lime">Rahul Mehta</span>
          </p>

          <div className="grid sm:grid-cols-3 gap-10 mb-20">
            {stats.map((s) => (
              <div key={s.value}>
                <div className="text-[3.5rem] sm:text-[4.5rem] font-heading font-medium text-navy-900 leading-none mb-3 tracking-tight">
                  {s.value}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-8 sm:gap-12 flex-wrap">
            {["Zerodha", "Upstox", "Indmoney", "Groww", "CoinDCX", "Binance"].map((name) => (
              <span key={name} className="text-xl sm:text-2xl font-bold tracking-tight text-gray-300 hover:text-gray-400 transition-colors duration-200">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="cta-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 py-24 text-center">
          <span className="inline-block px-5 py-2 rounded-full border border-white/15 text-brand-lime text-xs font-semibold tracking-wider uppercase mb-8">
            AI-Powered Wealth Management
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-heading font-medium text-white mb-5 tracking-tight">
            Ready to Take Control of Your Wealth?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-10 text-[1.05rem] leading-relaxed">
            Join thousands of investors using AI-driven insights to build smarter, diversified portfolios.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition shadow-lg shadow-brand-lime/20"
          >
            Schedule A Demo
          </Link>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8 pt-20 pb-10">
          <div className="grid lg:grid-cols-6 gap-12 mb-20">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <span className="text-xl font-heading font-bold text-gray-900 block mb-6">
                <span className="text-brand-lime mr-1">&#9670;</span>
                Invest<span className="text-brand-lime">.me</span>
              </span>
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
                  {/* App Store */}
                  <a href="#" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                    <div className="text-left">
                      <div className="text-[8px] leading-tight opacity-70">Download on the</div>
                      <div className="text-[12px] font-semibold leading-tight">App Store</div>
                    </div>
                  </a>
                  {/* Google Play */}
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
    </div>
  );
}
