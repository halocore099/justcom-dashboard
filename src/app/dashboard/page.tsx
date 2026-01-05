"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Euro,
  ShoppingCart,
  Package,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { api, Order, Product, DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getOrders().catch(() => []),
        api.getProducts().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        // Generate stats from available data
        const totalRevenue = ordersData.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const lowStock = productsData.filter(p => p.stock_count < 5).length;
        setStats({
          total_revenue: totalRevenue,
          revenue_change: 0,
          total_orders: ordersData.length,
          orders_change: 0,
          total_products: productsData.length,
          low_stock_products: lowStock,
          open_conversations: 0,
          avg_response_time: 0,
        });
      }

      setRecentOrders(ordersData.slice(0, 5));
      setProducts(productsData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const quickStats: QuickStat[] = stats ? [
    {
      label: "Total Revenue",
      value: `${stats.total_revenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.revenue_change,
      icon: Euro,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: stats.total_orders,
      change: stats.orders_change,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Products",
      value: stats.total_products,
      icon: Package,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      label: "Open Messages",
      value: stats.open_conversations,
      icon: MessageSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ] : [];

  const lowStockProducts = products.filter(p => p.stock_count < 5 && p.stock_count > 0);
  const outOfStockProducts = products.filter(p => p.stock_count === 0);

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}, {user?.first_name || "there"}!
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              {stat.change !== undefined && stat.change !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.change > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {stat.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stat.label === "Total Revenue" ? "€" : ""}{stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Out of Stock</p>
                <p className="text-sm text-red-600">{outOfStockProducts.length} products need restocking</p>
              </div>
              <Link
                href="/dashboard/products?filter=out-of-stock"
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                View
              </Link>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Package size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800">Low Stock Alert</p>
                <p className="text-sm text-amber-600">{lowStockProducts.length} products running low</p>
              </div>
              <Link
                href="/dashboard/products?filter=low-stock"
                className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                View
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{order.order_number}</p>
                        <p className="text-sm text-slate-500">
                          {order.customer_name || order.shipping_address?.name || "Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {order.currency === "EUR" ? "€" : order.currency}{order.total_amount?.toFixed(2) || "0.00"}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusStyles(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <ShoppingCart size={40} className="mx-auto text-slate-300" />
              <p className="mt-4 text-slate-500">No orders yet</p>
              <p className="text-sm text-slate-400">Orders will appear here once customers start purchasing</p>
            </div>
          )}
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/products"
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <Package size={24} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Products</span>
              </Link>
              <Link
                href="/dashboard/orders"
                className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
              >
                <ShoppingCart size={24} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Orders</span>
              </Link>
              <Link
                href="/dashboard/messages"
                className="flex flex-col items-center gap-2 p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors group"
              >
                <MessageSquare size={24} className="text-violet-600" />
                <span className="text-sm font-medium text-violet-700">Messages</span>
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
              >
                <TrendingUp size={24} className="text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Analytics</span>
              </Link>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Top Products</h2>
            </div>
            {products.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {products.slice(0, 4).map((product, index) => (
                  <div key={product.id} className="px-6 py-3 flex items-center gap-4">
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category}</p>
                    </div>
                    <p className="font-semibold text-slate-900">{product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <Package size={32} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
