"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";

const API = process.env.NEXT_PUBLIC_API_URL;
const emptyParent = { name: "", type: "EXPENSE" };
const emptySub = { name: "", parentId: "" };

export default function CategoriesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [modal, setModal] = useState<"parent" | "sub" | "edit" | null>(null);
  const [parentForm, setParentForm] = useState({ ...emptyParent });
  const [subForm, setSubForm] = useState({ ...emptySub });
  const [editForm, setEditForm] = useState({ name: "", type: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status]);

  const fetchData = () => fetch(`${API}/api/categories`).then(r => r.json()).then((data) => {
    setCategories(data);
    setExpanded(data.map((c: any) => c.id));
  }).catch(() => {});
  useEffect(() => { if (status === "authenticated") fetchData(); }, [status]);

  const toggleExpand = (id: number) => setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const saveParent = async () => {
    await fetch(`${API}/api/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parentForm) });
    setParentForm({ ...emptyParent }); setModal(null); fetchData();
  };

  const saveSub = async () => {
    await fetch(`${API}/api/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: subForm.name, type: "EXPENSE", parent: { id: parseInt(subForm.parentId) } }) });
    setSubForm({ ...emptySub }); setModal(null); fetchData();
  };

  const saveEdit = async () => {
    await fetch(`${API}/api/categories/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    setModal(null); fetchData();
  };

  const del = async (id: number) => { await fetch(`${API}/api/categories/${id}`, { method: "DELETE" }); fetchData(); };

  const openEdit = (c: any) => { setEditingId(c.id); setEditForm({ name: c.name, type: c.type }); setModal("edit"); };
  const openSub = (parentId: number) => { setSubForm({ name: "", parentId: String(parentId) }); setModal("sub"); };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <button onClick={() => { setParentForm({ ...emptyParent }); setModal("parent"); }} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-green-50 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                <div className="flex items-center gap-3">
                  {c.subcategories?.length > 0
                    ? expanded.includes(c.id) ? <ChevronDown size={18} className="text-green-600" /> : <ChevronRight size={18} className="text-green-600" />
                    : <span className="w-[18px]" />}
                  <span className="font-semibold text-gray-800">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === "INCOME" ? "bg-green-100 text-green-600" : "bg-red-50 text-red-500"}`}>{c.type}</span>
                  {c.subcategories?.length > 0 && <span className="text-xs text-gray-400">{c.subcategories.length} subcategories</span>}
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openSub(c.id)} className="flex items-center gap-1 text-xs text-green-600 hover:underline"><Plus size={14} /> Add Sub</button>
                  <button onClick={() => openEdit(c)} className="text-blue-400 hover:text-blue-600"><Pencil size={15} /></button>
                  <button onClick={() => del(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>

              {expanded.includes(c.id) && c.subcategories?.length > 0 && (
                <div className="border-t">
                  {c.subcategories.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3 ml-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-sm text-gray-600">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(sub)} className="text-blue-400 hover:text-blue-600"><Pencil size={14} /></button>
                        <button onClick={() => del(sub.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="text-gray-400 text-sm">No categories yet.</p>}
        </div>
      </main>

      {modal === "parent" && (
        <Modal title="Add Category" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Category Name (e.g. Food & Household)" value={parentForm.name} onChange={e => setParentForm({ ...parentForm, name: e.target.value })} />
            <select className="w-full border rounded-xl px-4 py-2 text-sm text-black" value={parentForm.type} onChange={e => setParentForm({ ...parentForm, type: e.target.value })}>
              <option value="EXPENSE">EXPENSE</option>
              <option value="INCOME">INCOME</option>
            </select>
            <button onClick={saveParent} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 text-sm font-medium">Save</button>
          </div>
        </Modal>
      )}

      {modal === "sub" && (
        <Modal title="Add Subcategory" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Adding to: <span className="font-medium text-gray-700">{categories.find(c => c.id === parseInt(subForm.parentId))?.name}</span></p>
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" placeholder="Subcategory Name (e.g. Groceries)" value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} />
            <button onClick={saveSub} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 text-sm font-medium">Save</button>
          </div>
        </Modal>
      )}

      {modal === "edit" && (
        <Modal title="Edit Category" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input className="w-full border rounded-xl px-4 py-2 text-sm text-black" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            <select className="w-full border rounded-xl px-4 py-2 text-sm text-black" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
              <option value="EXPENSE">EXPENSE</option>
              <option value="INCOME">INCOME</option>
            </select>
            <button onClick={saveEdit} className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 text-sm font-medium">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
