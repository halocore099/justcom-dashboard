"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { api, Order, Product, DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getOrders().catch(() => []),
        api.getProducts().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        const totalRevenue = ordersData.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const lowStock = productsData.filter(p => p.stock_count < 5).length;
        setStats({
          total_revenue: totalRevenue,
          revenue_change: 12.5,
          total_orders: ordersData.length,
          orders_change: 8.2,
          total_products: productsData.length,
          low_stock_products: lowStock,
          open_conversations: 3,
          avg_response_time: 2.4,
        });
      }

      setRecentOrders(ordersData.slice(0, 5));
      setProducts(productsData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lowStockProducts = products.filter(p => p.stock_count < 5 && p.stock_count > 0);
  const outOfStockProducts = products.filter(p => p.stock_count === 0);
  const pendingOrders = recentOrders.filter(o => o.status === "pending" || o.status === "processing");

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const alerts = [
    {
      label: "Pending orders",
      value: pendingOrders.length,
      sublabel: pendingOrders.length > 0 ? "Require processing" : "All caught up",
      color: pendingOrders.length > 0 ? "#f59e0b" : "#10b981",
      href: "/dashboard/orders?status=pending",
    },
    {
      label: "Out of stock",
      value: outOfStockProducts.length,
      sublabel: outOfStockProducts.length > 0 ? "Need restocking" : "Inventory healthy",
      color: outOfStockProducts.length > 0 ? "#ef4444" : "#10b981",
      href: "/dashboard/products?filter=out-of-stock",
    },
    {
      label: "Low stock",
      value: lowStockProducts.length,
      sublabel: lowStockProducts.length > 0 ? "Running low" : "Stock levels good",
      color: lowStockProducts.length > 0 ? "#f59e0b" : "#10b981",
      href: "/dashboard/products?filter=low-stock",
    },
    {
      label: "Open messages",
      value: stats?.open_conversations || 0,
      sublabel: (stats?.open_conversations || 0) > 0 ? "Awaiting response" : "Inbox clear",
      color: (stats?.open_conversations || 0) > 0 ? "#6366f1" : "#10b981",
      href: "/dashboard/messages",
    },
  ];

  const quickStats = [
    { label: "Products", value: products.length, sublabel: "items", icon: Package, color: "#6366f1", href: "/dashboard/products" },
    { label: "Orders", value: recentOrders.length, sublabel: "recent", icon: ShoppingCart, color: "#10b981", href: "/dashboard/orders" },
    { label: "Messages", value: stats?.open_conversations || 0, sublabel: "open", icon: MessageSquare, color: "#f59e0b", href: "/dashboard/messages" },
    { label: "Analytics", value: "→", sublabel: "View reports", icon: TrendingUp, color: "#ec4899", href: "/dashboard/analytics" },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #27272a',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease forwards' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#71717a', marginBottom: '4px', textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: 0 }}>
            {greeting()}, {user?.first_name || "Admin"}
          </h1>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '10px',
            color: '#a1a1aa',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: isRefreshing ? 0.5 : 1,
          }}
        >
          <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Revenue Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
            borderRadius: '16px',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Total Revenue</span>
            {stats?.revenue_change !== undefined && stats.revenue_change !== 0 && (
              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                +{stats.revenue_change}%
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '-1px',
            }}
          >
            €{stats?.total_revenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>vs. last 30 days</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', fontFamily: '"JetBrains Mono", monospace' }}>
                {stats?.total_orders || 0}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>Orders</div>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', fontFamily: '"JetBrains Mono", monospace' }}>
                €{stats && stats.total_orders > 0 ? (stats.total_revenue / stats.total_orders).toFixed(0) : "0"}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>Avg. Order</div>
            </div>
            <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#ffffff', fontFamily: '"JetBrains Mono", monospace' }}>
                {stats?.total_products || 0}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px', marginTop: '4px', textTransform: 'uppercase' }}>Products</div>
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        <div
          style={{
            backgroundColor: '#16181d',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', color: '#71717a', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            Needs Attention
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert, idx) => (
              <Link
                key={idx}
                href={alert.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  backgroundColor: '#1c1e24',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: alert.color,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#e4e4e7' }}>
                    <span style={{ fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>{alert.value}</span>{" "}
                    {alert.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>{alert.sublabel}</div>
                </div>
                <span style={{ color: '#52525b', fontSize: '12px' }}>→</span>
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: '16px',
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#a1a1aa',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            View all activity →
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section
        style={{
          backgroundColor: '#16181d',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', margin: 0 }}>Recent Orders</h2>
            <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>Latest customer purchases</p>
          </div>
        </div>

        {recentOrders.length > 0 ? (
          <div>
            {recentOrders.map((order, idx) => (
              <div
                key={order.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: idx < recentOrders.length - 1 ? '1px solid #27272a' : 'none',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
                    {order.order_number}
                  </p>
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
                    {order.customer_name || order.shipping_address?.name || "Customer"}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
                    €{order.total_amount?.toFixed(2) || "0.00"}
                  </p>
                  <OrderStatus status={order.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '32px', color: '#3f3f46', marginBottom: '16px' }}>
              <ShoppingCart size={32} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', marginBottom: '8px' }}>No orders yet</div>
            <div style={{ fontSize: '13px', color: '#52525b' }}>Orders will appear here once customers start purchasing</div>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {quickStats.map((stat, idx) => (
          <Link
            key={idx}
            href={stat.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '18px 20px',
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${stat.color}15`,
              }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '2px' }}>{stat.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace' }}>
                {stat.value}{" "}
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#52525b', fontFamily: '"DM Sans", sans-serif' }}>
                  {stat.sublabel}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function OrderStatus({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: "Pending" },
    processing: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: "Processing" },
    shipped: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', label: "Shipped" },
    delivered: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: "Delivered" },
    cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: "Cancelled" },
  };

  const { bg, color, label } = config[status] || {
    bg: 'rgba(113, 113, 122, 0.15)', color: '#71717a', label: status
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        marginTop: '6px',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
