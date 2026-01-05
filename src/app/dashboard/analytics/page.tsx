"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock data
const salesData = [
  { date: "Jan 1", revenue: 4200, orders: 28 },
  { date: "Jan 2", revenue: 3800, orders: 24 },
  { date: "Jan 3", revenue: 5100, orders: 32 },
  { date: "Jan 4", revenue: 4700, orders: 29 },
  { date: "Jan 5", revenue: 6200, orders: 41 },
  { date: "Jan 6", revenue: 5800, orders: 38 },
  { date: "Jan 7", revenue: 7100, orders: 45 },
];

const categoryData = [
  { name: "iPhone", value: 45, color: "#3b82f6" },
  { name: "MacBook", value: 25, color: "#8b5cf6" },
  { name: "iPad", value: 15, color: "#06b6d4" },
  { name: "Watch", value: 10, color: "#f59e0b" },
  { name: "Accessories", value: 5, color: "#10b981" },
];

const topProducts = [
  { name: "iPhone 14 Pro", sales: 45, revenue: 40455 },
  { name: "MacBook Air M2", sales: 23, revenue: 27577 },
  { name: "iPhone 13", sales: 38, revenue: 24662 },
  { name: "iPad Pro 12.9", sales: 18, revenue: 19782 },
  { name: "AirPods Pro 2", sales: 52, revenue: 12948 },
];

const timeRanges = ["7 days", "30 days", "90 days", "12 months"];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("7 days");

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your store performance</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold mt-1">
                €{totalRevenue.toLocaleString("de-DE")}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp size={14} /> +12.5%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold mt-1">{totalOrders}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp size={14} /> +8.3%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-semibold mt-1">
                €{avgOrderValue.toFixed(2)}
              </p>
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <TrendingDown size={14} /> -2.1%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New Customers</p>
              <p className="text-2xl font-semibold mt-1">156</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp size={14} /> +15.2%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders per Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 w-6">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} units sold</p>
                </div>
                <p className="font-semibold text-gray-900">
                  €{product.revenue.toLocaleString("de-DE")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
