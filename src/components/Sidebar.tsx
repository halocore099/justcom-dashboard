"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"
    : "User";

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 hover:bg-slate-50 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold">JC</span>
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">JUSTCOM</span>
              <p className="text-xs text-slate-500">Employee Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Menu
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isExactDashboard = item.href === "/dashboard" && pathname === "/dashboard";
              const shouldHighlight = isExactDashboard || (item.href !== "/dashboard" && isActive);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${
                      shouldHighlight
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <item.icon size={20} className={shouldHighlight ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
                  <span className="flex-1">{item.name}</span>
                  {shouldHighlight && <ChevronRight size={16} className="text-white/70" />}
                </Link>
              );
            })}

            <div className="pt-4">
              <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Account
              </p>
              <Link
                href="/dashboard/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    pathname === "/dashboard/settings"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Settings size={20} className={pathname === "/dashboard/settings" ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
                <span className="flex-1">Settings</span>
              </Link>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-white">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "user@justcom.de"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
