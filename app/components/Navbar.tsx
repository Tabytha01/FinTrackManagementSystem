"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Target, Tag, Bell, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export default function Navbar({ unreadCount = 0 }: { unreadCount?: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6 border-b">
        <span className="text-xl font-bold text-green-600">FinTrack</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.href ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              <span>{l.label}</span>
              {l.href === "/notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <img src={session?.user?.image ?? ""} alt="avatar" className="w-9 h-9 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 py-2 px-3 rounded-lg">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
