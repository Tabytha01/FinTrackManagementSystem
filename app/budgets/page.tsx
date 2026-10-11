"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";

const API = process.env.NEXT_PUBLIC_API_URL;
const empty = { limitAmount: "", month: "", year: "", categoryId: "" };

export default function BudgetsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status]);

  const fetchData = () => {
    fetch(`${API}/api/budgets`).then(r => r.json()).then(setBudgets).catch(() => {});
    fetch(`${API}/api/transactions`).then(r => r.json()).then(setTransactions).catch(() => {});
    fetch(`${API}/api/categories/all`).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  };

  useEffect(() => { if (status === "authenticated") fetchData(); }, [status]);

  const openAdd = () => { setForm({ ...empty }); setEditingId(null); setModal(true); };
  const openEdit = (b: any) => { setForm({ limitAmount: b.limitAmount, month: b.month, year: b.year, categoryId: b.category?.id }); setEditingId(b.id); setModal(true); };

  const save = async () => {
    const body = JSON.stringify({ limitAmount: parseFloat(form.limitAmount), month: parseInt(form.month), year: parseInt(form.year), category: { id: parseInt(form.categoryId) } });
    if (editingId) {
      await fetch(`${API}/api/budgets/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    } else {
      await fetch(`${API}/api/budgets`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    }
    setModal(false); fetchData();
  };

  const del = async (id: number) => { await fetch(`${API}/api/budgets/${id}`, { method: "DELETE" }); fetchData(); };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Budgets</h1>
          <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm font-medium">+ Add Budget</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {budgets.map((b: any) => {
            const spent = transactions.filter(t => t.category?.id === b.category?.id || t.category?.parent?.id === b.category?.id).reduce((sum, t) => sum + t.amount, 0);
            const pct = Math.min((spent / b.limitAmount) * 100, 100);
            const over = spent > b.limitAmount;
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{b.category?.name ?? "N/A"}</h3>
                    <p className="text-xs text-gray-400">{b.month}/{b.year}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="text-blue-500 text-xs hover:underline">Edit</button>
                    <button onClick={() => del(b.id)} className="text-red-400 text-xs hover:underline">Delete</button>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Spent: <span className={over ? "text-red-500 font-semibold" : "text-gray-700 font-semibold"}>{spent.toLocaleString()} RWF</span></span>
                  <span className="text-gray-500">Limit: <span className="text-gray-700 font-semibold">{b.limitAmount?.toLocaleString()} RWF</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${over ? "bg-red-500" : pct > 75 ? "bg-yellow-400" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mt-2 ${over ? "text-red-500" : "text-gray-400"}`}>
                  {over ? `Over budget by ${(spent - b.limitAmount).toLocaleString()} RWF` : `${(b.limitAmount - spent).toLocaleString()} RWF remaining`}
                </p>
              </div>
            );
          })}
          {budgets.length === 0 && <p className="text-gray-400 text-sm col-span-2">No budgets yet.</p>}
        </div>
      </main>

      {modal && (
        <Modal title={editingId ? "Edit Budget" : "Add Budget"} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <select className="w-full border rounded-xl px-4 py-2 text-sm text-black" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Limit Amount (RWF)" type="number" value={form.limitAmount} onChange={e => setForm({ ...form, limitAmount: e.target.value })} />
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Month (1-12)" type="number" min="1" max="12" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Year (e.g. 2026)" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 text-sm font-medium">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
