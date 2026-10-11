"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [modal, setModal] = useState<"category" | "budget" | "transaction" | "editCategory" | "editBudget" | "editTransaction" | null>(null);

  const [catForm, setCatForm] = useState({ name: "", type: "EXPENSE" });
  const [budgetForm, setBudgetForm] = useState({ limitAmount: "", month: "", year: "", categoryId: "" });
  const [txForm, setTxForm] = useState({ description: "", amount: "", date: "", paymentMethod: "CASH", categoryId: "" });

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status]);

  const fetchAll = () => {
    fetch(`${API}/api/categories`).then(r => r.json()).then(setCategories).catch(() => {});
    fetch(`${API}/api/budgets`).then(r => r.json()).then(setBudgets).catch(() => {});
    fetch(`${API}/api/transactions`).then(r => r.json()).then(setTransactions).catch(() => {});
    fetch(`${API}/api/notifications/unread`).then(r => r.json()).then((d) => setUnreadCount(d.length)).catch(() => {});
  };

  useEffect(() => { if (status === "authenticated") fetchAll(); }, [status]);

  // Category CRUD
  const addCategory = async () => {
    await fetch(`${API}/api/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) });
    setCatForm({ name: "", type: "EXPENSE" }); setModal(null); fetchAll();
  };

  const openEditCategory = (c: any) => {
    setEditingId(c.id); setCatForm({ name: c.name, type: c.type }); setModal("editCategory");
  };

  const updateCategory = async () => {
    await fetch(`${API}/api/categories/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) });
    setCatForm({ name: "", type: "EXPENSE" }); setModal(null); fetchAll();
  };

  const deleteCategory = async (id: number) => {
    await fetch(`${API}/api/categories/${id}`, { method: "DELETE" }); fetchAll();
  };

  // Budget CRUD
  const addBudget = async () => {
    await fetch(`${API}/api/budgets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limitAmount: parseFloat(budgetForm.limitAmount), month: parseInt(budgetForm.month), year: parseInt(budgetForm.year), category: { id: parseInt(budgetForm.categoryId) } }) });
    setBudgetForm({ limitAmount: "", month: "", year: "", categoryId: "" }); setModal(null); fetchAll();
  };

  const openEditBudget = (b: any) => {
    setEditingId(b.id); setBudgetForm({ limitAmount: b.limitAmount, month: b.month, year: b.year, categoryId: b.category?.id }); setModal("editBudget");
  };

  const updateBudget = async () => {
    await fetch(`${API}/api/budgets/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limitAmount: parseFloat(budgetForm.limitAmount), month: parseInt(budgetForm.month), year: parseInt(budgetForm.year), category: { id: parseInt(budgetForm.categoryId) } }) });
    setBudgetForm({ limitAmount: "", month: "", year: "", categoryId: "" }); setModal(null); fetchAll();
  };

  const deleteBudget = async (id: number) => {
    await fetch(`${API}/api/budgets/${id}`, { method: "DELETE" }); fetchAll();
  };

  // Transaction CRUD
  const addTransaction = async () => {
    await fetch(`${API}/api/transactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: txForm.description, amount: parseFloat(txForm.amount), date: txForm.date, paymentMethod: txForm.paymentMethod, category: { id: parseInt(txForm.categoryId) } }) });
    setTxForm({ description: "", amount: "", date: "", paymentMethod: "CASH", categoryId: "" }); setModal(null); fetchAll();
  };

  const openEditTransaction = (t: any) => {
    setEditingId(t.id);
    setTxForm({ description: t.description, amount: t.amount, date: t.date, paymentMethod: t.paymentMethod, categoryId: t.category?.id });
    setModal("editTransaction");
  };

  const updateTransaction = async () => {
    await fetch(`${API}/api/transactions/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: txForm.description, amount: parseFloat(txForm.amount), date: txForm.date, paymentMethod: txForm.paymentMethod, category: { id: parseInt(txForm.categoryId) } }) });
    setTxForm({ description: "", amount: "", date: "", paymentMethod: "CASH", categoryId: "" }); setModal(null); fetchAll();
  };

  const deleteTransaction = async (id: number) => {
    await fetch(`${API}/api/transactions/${id}`, { method: "DELETE" }); fetchAll();
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const categoryForm = (onSave: () => void) => (
    <div className="space-y-3">
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black placeholder-black" placeholder="Name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
      <select className="w-full border rounded-lg px-3 py-2 text-sm text-black" value={catForm.type} onChange={e => setCatForm({ ...catForm, type: e.target.value })}>
        <option value="EXPENSE">EXPENSE</option>
        <option value="INCOME">INCOME</option>
      </select>
      <button onClick={onSave} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 text-sm">Save</button>
    </div>
  );

  const budgetFormEl = (onSave: () => void) => (
    <div className="space-y-3">
      <select className="w-full border rounded-lg px-3 py-2 text-sm text-black" value={budgetForm.categoryId} onChange={e => setBudgetForm({ ...budgetForm, categoryId: e.target.value })}>
        <option value="">Select Category</option>
        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black placeholder-black" placeholder="Limit Amount (RWF)" type="number" value={budgetForm.limitAmount} onChange={e => setBudgetForm({ ...budgetForm, limitAmount: e.target.value })} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black placeholder-black" placeholder="Month (1-12)" type="number" min="1" max="12" value={budgetForm.month} onChange={e => setBudgetForm({ ...budgetForm, month: e.target.value })} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black placeholder-black" placeholder="Year (e.g. 2026)" type="number" value={budgetForm.year} onChange={e => setBudgetForm({ ...budgetForm, year: e.target.value })} />
      <button onClick={onSave} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 text-sm">Save</button>
    </div>
  );

  const transactionFormEl = (onSave: () => void) => (
    <div className="space-y-3">
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black placeholder-black" placeholder="Description" value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black placeholder-black" placeholder="Amount (RWF)" type="number" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm text-black" type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })} />
      <select className="w-full border rounded-lg px-3 py-2 text-sm text-black" value={txForm.paymentMethod} onChange={e => setTxForm({ ...txForm, paymentMethod: e.target.value })}>
        <option value="CASH">CASH</option>
        <option value="CARD">CARD</option>
        <option value="MOBILE_MONEY">MOBILE MONEY</option>
      </select>
      <select className="w-full border rounded-lg px-3 py-2 text-sm text-black" value={txForm.categoryId} onChange={e => setTxForm({ ...txForm, categoryId: e.target.value })}>
        <option value="">Select Category</option>
        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button onClick={onSave} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 text-sm">Save</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">FinTrack</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/notifications")} className="relative text-gray-600 hover:text-green-600">
            🔔 {unreadCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>}
          </button>
          <img src={session?.user?.image ?? ""} alt="avatar" className="w-8 h-8 rounded-full" />
          <span className="text-gray-700 text-sm">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">

        {/* Categories */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Categories ({categories.length})</h2>
            <button onClick={() => { setCatForm({ name: "", type: "EXPENSE" }); setModal("category"); }} className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">+ Add</button>
          </div>
          <ul className="space-y-2">
            {categories.map((c: any) => (
              <li key={c.id} className="flex justify-between items-center text-sm text-gray-600 border-b pb-1">
                <span>{c.name} <span className="text-xs text-gray-400">{c.type}</span></span>
                <div className="flex gap-2">
                  <button onClick={() => openEditCategory(c)} className="text-blue-400 hover:text-blue-600 text-xs">Edit</button>
                  <button onClick={() => deleteCategory(c.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Budgets ({budgets.length})</h2>
            <button onClick={() => { setBudgetForm({ limitAmount: "", month: "", year: "", categoryId: "" }); setModal("budget"); }} className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">+ Add</button>
          </div>
          <ul className="space-y-2">
            {budgets.map((b: any) => (
              <li key={b.id} className="flex justify-between items-center text-sm text-gray-600 border-b pb-1">
                <span>{b.category?.name ?? "N/A"} <span className="text-green-600 font-medium">{b.limitAmount?.toLocaleString()} RWF</span> <span className="text-xs text-gray-400">{b.month}/{b.year}</span></span>
                <div className="flex gap-2">
                  <button onClick={() => openEditBudget(b)} className="text-blue-400 hover:text-blue-600 text-xs">Edit</button>
                  <button onClick={() => deleteBudget(b.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Transactions ({transactions.length})</h2>
            <button onClick={() => { setTxForm({ description: "", amount: "", date: "", paymentMethod: "CASH", categoryId: "" }); setModal("transaction"); }} className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">+ Add</button>
          </div>
          <ul className="space-y-2">
            {transactions.map((t: any) => (
              <li key={t.id} className="flex justify-between items-center text-sm text-gray-600 border-b pb-1">
                <span>{t.description} <span className="text-xs text-gray-400">{t.date}</span></span>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">{t.amount?.toLocaleString()} RWF</span>
                  <button onClick={() => openEditTransaction(t)} className="text-blue-400 hover:text-blue-600 text-xs">Edit</button>
                  <button onClick={() => deleteTransaction(t.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {modal === "category" && <Modal title="Add Category" onClose={() => setModal(null)}>{categoryForm(addCategory)}</Modal>}
      {modal === "editCategory" && <Modal title="Edit Category" onClose={() => setModal(null)}>{categoryForm(updateCategory)}</Modal>}
      {modal === "budget" && <Modal title="Add Budget" onClose={() => setModal(null)}>{budgetFormEl(addBudget)}</Modal>}
      {modal === "editBudget" && <Modal title="Edit Budget" onClose={() => setModal(null)}>{budgetFormEl(updateBudget)}</Modal>}
      {modal === "transaction" && <Modal title="Add Transaction" onClose={() => setModal(null)}>{transactionFormEl(addTransaction)}</Modal>}
      {modal === "editTransaction" && <Modal title="Edit Transaction" onClose={() => setModal(null)}>{transactionFormEl(updateTransaction)}</Modal>}
    </div>
  );
}
