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
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: 3 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
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
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          padding: '10px',
          backgroundColor: '#16181d',
          borderRadius: '10px',
          border: '1px solid #27272a',
          cursor: 'pointer',
          display: 'none',
        }}
        className="lg:!hidden !flex"
      >
        {isMobileMenuOpen ? (
          <X size={20} color="#fafafa" />
        ) : (
          <Menu size={20} color="#a1a1aa" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 40,
          }}
          className="lg:!hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          backgroundColor: '#16181d',
          borderRight: '1px solid #27272a',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
        className={`
          max-lg:!fixed max-lg:!inset-y-0 max-lg:!left-0 max-lg:!z-40
          max-lg:!transition-transform max-lg:!duration-300
          ${isMobileMenuOpen ? 'max-lg:!translate-x-0' : 'max-lg:!-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>JC</span>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fafafa', letterSpacing: '0.5px' }}>
            JUSTCOM
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: shouldHighlight ? '#27272a' : 'transparent',
                  color: shouldHighlight ? '#fafafa' : '#a1a1aa',
                }}
              >
                <item.icon
                  size={18}
                  style={{ color: shouldHighlight ? '#3b82f6' : 'currentColor', flexShrink: 0 }}
                />
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.badge && (
                  <span
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #27272a', marginTop: 'auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#6366f1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{userInitials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName}
              </p>
              <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || "user@justcom.de"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#71717a',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
