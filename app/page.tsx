"use client";
import { signIn } from "next-auth/react";
import { TrendingUp, Target, Bell } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-sm">
        <span className="text-2xl font-bold text-green-600">FinTrack</span>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 font-medium"
        >
          Get Started
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
          Take Control of Your <span className="text-green-600">Finances</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Track your spending, set budgets, and get real-time alerts when you overspend — all in one place.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-8 py-4 text-gray-700 font-medium hover:bg-gray-50 shadow-md mx-auto text-lg"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, title: "Track Spending", desc: "See exactly where your money goes with detailed transaction history.", color: "text-blue-500 bg-blue-50" },
          { icon: Target, title: "Set Budgets", desc: "Create monthly budgets per category and stay on track.", color: "text-green-500 bg-green-50" },
          { icon: Bell, title: "Smart Alerts", desc: "Get instant notifications when you exceed your budget limits.", color: "text-red-500 bg-red-50" },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${f.color}`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
