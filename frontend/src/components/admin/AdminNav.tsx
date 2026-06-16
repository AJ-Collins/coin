import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid, Users, Megaphone, Settings, User as UserIcon,
  ArrowLeftRight, ArrowDownToLine, LogOut, Menu, X,
} from "lucide-react";
import { useAuth } from "../../lib/auth";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/marketers", label: "Marketers", icon: Megaphone },
  { to: "/admin/trades", label: "Trades", icon: ArrowLeftRight },
  { to: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
];

export default function AdminNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-4 px-4 md:px-6 h-16 bg-[#05070a] border-b border-[#1a1f28]">
        <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-300 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/admin" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo-head.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xs font-bold text-[#39ff88] uppercase tracking-wider hidden sm:inline">Admin</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-[#39ff88]/10 text-[#39ff88]" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <button onClick={logout} className="text-gray-400 cursor-pointer transition-colors">
            <LogOut className="h-5 w-5 text-[#ff4d6d]" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#05070a] border-r border-[#1a1f28] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <img src="/logo-head.png" alt="Logo" className="h-8 w-auto" />
              <button onClick={() => setMobileOpen(false)} className="text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active ? "bg-[#39ff88]/10 text-[#39ff88]" : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}