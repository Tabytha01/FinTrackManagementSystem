"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";

const API = process.env.NEXT_PUBLIC_API_URL;
const empty = { description: "", amount: "", date: "", paymentMethod: "CASH", categoryId: "" };

export default function TransactionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status]);

  const fetchData = () => {
    fetch(`${API}/api/transactions`).then(r => r.json()).then(setTransactions).catch(() => {});
    fetch(`${API}/api/categories/all`).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  };

  useEffect(() => { if (status === "authenticated") fetchData(); }, [status]);

  const openAdd = () => { setForm({ ...empty }); setEditingId(null); setModal(true); };
  const openEdit = (t: any) => { setForm({ description: t.description, amount: t.amount, date: t.date, paymentMethod: t.paymentMethod, categoryId: t.category?.id }); setEditingId(t.id); setModal(true); };

  const save = async () => {
    const body = JSON.stringify({ description: form.description, amount: parseFloat(form.amount), date: form.date, paymentMethod: form.paymentMethod, category: { id: parseInt(form.categoryId) } });
    if (editingId) {
      await fetch(`${API}/api/transactions/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    } else {
      await fetch(`${API}/api/transactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    }
    setModal(false); fetchData();
  };

  const del = async (id: number) => { await fetch(`${API}/api/transactions/${id}`, { method: "DELETE" }); fetchData(); };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm font-medium">+ Add Transaction</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Payment</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-700">{t.description}</td>
                  <td className="px-6 py-4 text-gray-500">{t.category?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-500">{t.date}</td>
                  <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs">{t.paymentMethod}</span></td>
                  <td className="px-6 py-4 text-right text-red-500 font-semibold">{t.amount?.toLocaleString()} RWF</td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button onClick={() => openEdit(t)} className="text-blue-500 hover:underline text-xs">Edit</button>
                    <button onClick={() => del(t.id)} className="text-red-400 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>

      {modal && (
        <Modal title={editingId ? "Edit Transaction" : "Add Transaction"} onClose={() => setModal(false)}>
          <div className="space-y-3">
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Amount (RWF)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <select className="w-full border rounded-xl px-4 py-2 text-sm text-black" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="CASH">CASH</option>
              <option value="CARD">CARD</option>
              <option value="MOBILE_MONEY">MOBILE MONEY</option>
            </select>
            <select className="w-full border rounded-xl px-4 py-2 text-sm text-black" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={save} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 text-sm font-medium">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
