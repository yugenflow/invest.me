import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Bell,
  Users,
  Calendar,
  BookOpen,
} from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white font-body flex flex-col">
      <Navbar />

      {/* Content */}
      <section className="hero-gradient relative overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-8 py-20 text-center w-full">
          {/* Animated rings */}
          <div className="relative w-40 h-40 mx-auto mb-12">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-white/8 animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute inset-8 rounded-full border border-dashed border-white/6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-lime/20 border border-brand-lime/30 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8 text-brand-lime" />
              </div>
            </div>
          </div>

          <span className="inline-block px-5 py-2 rounded-full border border-white/15 text-brand-lime text-xs font-semibold tracking-wider uppercase mb-8">
            Coming Soon
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-white tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6">
            The Invest.me Community
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed mb-12">
            We&apos;re building a space for investors to connect, share insights, and grow together. Join the waitlist to be the first to know when we launch.
          </p>

          {/* Feature preview cards */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-14">
            {[
              { icon: Users, title: "Join the Community", desc: "Connect with like-minded investors and share strategies." },
              { icon: Calendar, title: "Events & Webinars", desc: "Live sessions with market experts and portfolio coaches." },
              { icon: BookOpen, title: "Investor Stories", desc: "Real stories from real investors on their wealth journey." },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-6 text-left">
                <item.icon className="w-6 h-6 text-brand-lime mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Notify CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-lime text-navy-900 text-sm font-semibold hover:bg-brand-lime-hover transition shadow-lg shadow-brand-lime/20"
            >
              <Bell className="w-4 h-4" />
              Join the Waitlist
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
