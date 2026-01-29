import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield,
  Target,
  Eye,
  BookOpen,
  Users,
  Heart,
} from "lucide-react";

const leaders = [
  { name: "Prateek Sharma", role: "Founder & CEO", initials: "PS", color: "from-brand-lime to-emerald-400" },
  { name: "Ananya Rao", role: "CTO", initials: "AR", color: "from-cyan-400 to-blue-500" },
  { name: "Vikram Desai", role: "Head of AI", initials: "VD", color: "from-purple-400 to-violet-500" },
  { name: "Meera Kapoor", role: "Head of Product", initials: "MK", color: "from-amber-400 to-orange-500" },
  { name: "Rohan Joshi", role: "Head of Finance", initials: "RJ", color: "from-emerald-400 to-teal-500" },
  { name: "Sneha Patel", role: "Head of Operations", initials: "SP", color: "from-pink-400 to-rose-500" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 pt-36 pb-20 text-center">
          <span className="inline-block px-5 py-2 rounded-full border border-white/15 text-brand-lime text-xs font-semibold tracking-wider uppercase mb-8">
            About Invest.me
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-white tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6">
            Building the Future of Intelligent Wealth Management
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We&apos;re on a mission to democratize institutional-grade financial intelligence for every Indian investor.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section id="who-we-are" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 tracking-wider uppercase mb-8">
                <Users className="w-3.5 h-3.5" /> Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight">
                A Team of Investors, Engineers, and AI Researchers
              </h2>
              <p className="text-gray-500 text-[1.05rem] leading-relaxed mb-4">
                Invest.me is a modern, holistic wealth management platform acting as your intelligent financial advisor. We aggregate your assets across equities, mutual funds, crypto, and alternative assets to provide a unified net worth snapshot.
              </p>
              <p className="text-gray-500 text-[1.05rem] leading-relaxed">
                Beyond tracking, we offer Smart Signals, risk-adjusted optimization, and institutional-grade market intelligence — all powered by AI and built for the Indian investor.
              </p>
            </div>
            <div className="bg-gray-50 rounded-4xl p-10 border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { stat: "200K+", label: "Active Investors" },
                  { stat: "&#8377;500Cr+", label: "Assets Tracked" },
                  { stat: "15+", label: "Broker Integrations" },
                  { stat: "98%", label: "User Satisfaction" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl font-heading font-medium text-navy-900 mb-1" dangerouslySetInnerHTML={{ __html: s.stat }} />
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-8">
              <Target className="w-8 h-8 text-brand-lime" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight">Our Mission</h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              To empower every individual investor with the same caliber of financial intelligence, risk analysis, and portfolio optimization tools that were previously available only to institutional investors and high-net-worth individuals. We believe smart investing shouldn&apos;t require a finance degree.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-8">
              <Eye className="w-8 h-8 text-brand-lime" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight">Our Vision</h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              A world where every investor — from a first-time mutual fund buyer to a seasoned equity trader — has access to a single, intelligent platform that understands their goals, monitors their risk, and guides them toward sustainable wealth creation. We envision Invest.me as India&apos;s most trusted AI-powered financial companion.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-8">
              <BookOpen className="w-8 h-8 text-brand-lime" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight text-center">Our Story</h2>
            <div className="space-y-6 text-gray-500 text-[1.05rem] leading-relaxed">
              <p>
                Invest.me was born from a simple frustration: managing investments across multiple platforms — Zerodha for equities, Groww for mutual funds, CoinDCX for crypto, and a spreadsheet for gold — made it nearly impossible to understand true portfolio health.
              </p>
              <p>
                We realized that the tools available to retail investors were either too simplistic (just tracking) or too complex (designed for professionals). There was nothing in between — no platform that could aggregate everything, assess risk intelligently, and deliver actionable, personalized advice.
              </p>
              <p>
                So we built Invest.me: a platform that combines the aggregation power of a portfolio tracker, the analytical depth of an AI research assistant, and the personalized guidance of a wealth advisor. Today, we serve over 200,000 investors across India, helping them make smarter, data-backed decisions every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-4 tracking-tight text-center">Leadership Team</h2>
          <p className="text-gray-500 text-lg text-center max-w-2xl mx-auto mb-16">
            A diverse team of technologists, finance professionals, and AI researchers united by a shared vision.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {leaders.map((l) => (
              <div key={l.name} className="rounded-3xl border border-gray-200 p-8 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${l.color} flex items-center justify-center text-xl text-white font-bold mx-auto mb-5 shadow-md`}>
                  {l.initials}
                </div>
                <h3 className="text-lg font-heading font-medium text-gray-900 mb-1">{l.name}</h3>
                <p className="text-sm text-gray-500">{l.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Responsibility */}
      <section id="responsibility" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-brand-lime" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-6 tracking-tight">Corporate Responsibility</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              We believe financial literacy is a fundamental right. Through our initiatives, we&apos;re committed to making investing knowledge accessible to all.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Financial Literacy", desc: "Free webinars and workshops for first-time investors across tier-2 and tier-3 cities." },
                { title: "Data Privacy", desc: "Zero data selling policy. Your financial data is encrypted and never shared with third parties." },
                { title: "Inclusive Design", desc: "Multilingual support and simplified interfaces to serve investors of all backgrounds." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100 text-left">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-white mb-5 tracking-tight">
            Join the Invest.me Journey
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8 text-[1.05rem] leading-relaxed">
            Start making smarter investment decisions today.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition shadow-lg shadow-brand-lime/20">
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
