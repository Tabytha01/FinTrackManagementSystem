"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`${API}/api/notifications`, { credentials: "include" })
      .then(r => r.json())
      .then(setNotifications)
      .catch(() => {});
  }, [status]);

  const markRead = async (id: string) => {
    await fetch(`${API}/api/notifications/${id}/read`, { method: "PUT", credentials: "include" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-600">FinTrack</h1>
        <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-500 hover:underline">← Back to Dashboard</button>
      </nav>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-400">No notifications yet.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${n.read ? "border-gray-200" : "border-red-500"}`}>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-blue-500 hover:underline mt-2">Mark as read</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
