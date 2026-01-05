"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";

// Mock data for demonstration
const mockStats = {
  totalRevenue: 45678.90,
  revenueChange: 12.5,
  totalOrders: 156,
  ordersChange: 8.3,
  totalProducts: 89,
  lowStockProducts: 7,
  openConversations: 23,
  avgResponseTime: 2.4,
};

const mockRecentOrders = [
  { id: "ORD-001", customer: "Max Müller", total: 599.00, status: "processing", date: "2025-01-05" },
  { id: "ORD-002", customer: "Anna Schmidt", total: 1299.00, status: "shipped", date: "2025-01-05" },
  { id: "ORD-003", customer: "Thomas Weber", total: 449.00, status: "pending", date: "2025-01-04" },
  { id: "ORD-004", customer: "Lisa Fischer", total: 899.00, status: "delivered", date: "2025-01-04" },
  { id: "ORD-005", customer: "Jan Bauer", total: 199.00, status: "confirmed", date: "2025-01-03" },
];

const mockRecentMessages = [
  { id: "MSG-001", customer: "Max Müller", subject: "Order status inquiry", priority: "high", time: "10 min ago" },
  { id: "MSG-002", customer: "Sarah Klein", subject: "Return request", priority: "medium", time: "25 min ago" },
  { id: "MSG-003", customer: "Peter Hoffmann", subject: "Product question", priority: "low", time: "1 hour ago" },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`€${mockStats.totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          change={mockStats.revenueChange}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Total Orders"
          value={mockStats.totalOrders}
          change={mockStats.ordersChange}
          changeLabel="vs last month"
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Products"
          value={mockStats.totalProducts}
          icon={Package}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title="Open Messages"
          value={mockStats.openConversations}
          icon={MessageSquare}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <a href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">€{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} variant="order" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            <a href="/dashboard/messages" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {mockRecentMessages.map((message) => (
              <div key={message.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{message.customer}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{message.subject}</p>
                  </div>
                  <StatusBadge status={message.priority} variant="priority" />
                </div>
                <p className="text-xs text-gray-400 mt-2">{message.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {mockStats.lowStockProducts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="text-orange-600" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-orange-800">Low Stock Alert</p>
            <p className="text-sm text-orange-600">
              {mockStats.lowStockProducts} products are running low on stock.
            </p>
          </div>
          <a
            href="/dashboard/products?filter=low-stock"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            View Products
          </a>
        </div>
      )}
    </div>
  );
}
