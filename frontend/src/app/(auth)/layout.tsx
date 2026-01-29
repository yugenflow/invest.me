"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-brand-black dark:text-white">
            Invest<span className="text-brand-lime">.me</span>
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
