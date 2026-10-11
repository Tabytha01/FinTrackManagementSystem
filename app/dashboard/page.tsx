"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Target, CheckCircle, List } from "lucide-react";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`${API}/api/transactions`).then(r => r.json()).then(setTransactions).catch(() => {});
    fetch(`${API}/api/budgets`).then(r => r.json()).then(setBudgets).catch(() => {});
    fetch(`${API}/api/notifications/unread`).then(r => r.json()).then((d) => setUnreadCount(d.length)).catch(() => {});
  }, [status]);

  const totalBudget = budgets.reduce((sum, b) => sum + (b.limitAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const spent = transactions
      .filter(t => t.category?.id === b.category?.id || t.category?.parent?.id === b.category?.id)
      .reduce((s, t) => s + (t.amount || 0), 0);
    return sum + spent;
  }, 0);
  const remaining = totalBudget - totalSpent;
  const recentTransactions = [...transactions].slice(-5).reverse();

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const cards = [
    { label: "Total Budget", value: `${totalBudget.toLocaleString()} RWF`, icon: Target, color: "text-gray-700", bg: "bg-white" },
    { label: "Total Spent", value: `${totalSpent.toLocaleString()} RWF`, icon: DollarSign, color: "text-gray-700", bg: "bg-white" },
    { label: "Remaining", value: `${remaining.toLocaleString()} RWF`, icon: CheckCircle, color: remaining >= 0 ? "text-green-600" : "text-red-500", bg: "bg-white" },
    { label: "No. of Transactions", value: transactions.length, icon: List, color: "text-gray-700", bg: "bg-white" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar unreadCount={unreadCount} />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bg} rounded-2xl shadow-sm p-5`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gray-50`}>
                  <Icon size={20} className={card.color} />
                </div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Budget Overview</h2>
          {budgets.length === 0 ? <p className="text-gray-400 text-sm">No budgets set yet.</p> : (
            <div className="space-y-4">
              {budgets.map((b: any) => {
                const spent = transactions.filter(t => t.category?.id === b.category?.id || t.category?.parent?.id === b.category?.id).reduce((sum, t) => sum + t.amount, 0);
                const pct = Math.min((spent / b.limitAmount) * 100, 100);
                const over = spent > b.limitAmount;
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{b.category?.name ?? "N/A"} <span className="text-gray-400 text-xs">{b.month}/{b.year}</span></span>
                      <span className={over ? "text-red-500 font-medium" : "text-gray-500"}>{spent.toLocaleString()} / {b.limitAmount.toLocaleString()} RWF</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${over ? "bg-red-500" : pct > 75 ? "bg-yellow-400" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            <button onClick={() => router.push("/transactions")} className="text-sm text-green-600 hover:underline">View all</button>
          </div>
          {recentTransactions.length === 0 ? <p className="text-gray-400 text-sm">No transactions yet.</p> : (
            <ul className="space-y-3">
              {recentTransactions.map((t: any) => (
                <li key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t.description}</p>
                    <p className="text-xs text-gray-400">{t.date} · {t.paymentMethod}</p>
                  </div>
                  <span className="text-red-500 font-semibold text-sm">{t.amount?.toLocaleString()} RWF</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
