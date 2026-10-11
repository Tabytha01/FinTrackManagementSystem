"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => { if (status === "unauthenticated") router.push("/"); }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`${API}/api/notifications`).then(r => r.json()).then(setNotifications).catch(() => {});
  }, [status]);

  const markRead = async (id: string) => {
    await fetch(`${API}/api/notifications/${id}/read`, { method: "PUT" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">No notifications yet.</div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${n.read ? "border-gray-200" : "border-red-500"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-blue-500 hover:underline ml-4 whitespace-nowrap">Mark as read</button>
                  )}
                </div>
                {n.read && <span className="text-xs text-gray-300 mt-1 inline-block">Read</span>}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
