"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  ShoppingCart,
  Users,
  Package,
  Loader2,
  RefreshCw,
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
} from "recharts";
import { api, Order, Product, SalesData } from "@/lib/api";

const timeRanges = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "12 months", value: "12m" },
];

const categoryColors: Record<string, string> = {
  iPhone: "#3b82f6",
  MacBook: "#8b5cf6",
  iPad: "#06b6d4",
  Watch: "#f59e0b",
  Accessories: "#10b981",
  Other: "#6b7280",
};

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, productsData, salesDataResult] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getProducts().catch(() => []),
        api.getSalesData(selectedRange).catch(() => []),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setSalesData(salesDataResult);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRange]);

  // Calculate stats from orders
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  // Generate chart data from orders if salesData is empty
  const chartData = salesData.length > 0 ? salesData : generateChartData(orders);

  // Calculate category distribution from products
  const categoryData = calculateCategoryDistribution(products);

  // Top products by price (since we don't have sales data)
  const topProducts = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedRange(range.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedRange === range.value
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2">
                <TrendingUp size={14} /> From {totalOrders} orders
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Euro className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</p>
              <p className="text-sm text-blue-600 flex items-center gap-1 mt-2">
                <TrendingUp size={14} /> {deliveredOrders} delivered
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {avgOrderValue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
                Per transaction
              </p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl">
              <Package className="text-violet-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Products</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
              <p className="text-sm text-amber-600 flex items-center gap-1 mt-2">
                {products.filter((p) => p.is_active).length} active
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <Users className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue Overview</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-slate-400">No data available</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Products by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
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
                      <span className="text-slate-600">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-slate-400">No products available</p>
            </div>
          )}
        </div>
      </div>

      {/* Orders Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Orders per Day</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-slate-400">No data available</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-semibold text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{product.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{product.stock_count} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-slate-400">No products available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function generateChartData(orders: Order[]) {
  if (orders.length === 0) return [];

  const last7Days: { [key: string]: { revenue: number; orders: number } } = {};
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    last7Days[key] = { revenue: 0, orders: 0 };
  }

  orders.forEach((order) => {
    const orderDate = order.created_at?.split("T")[0];
    if (orderDate && last7Days[orderDate]) {
      last7Days[orderDate].revenue += order.total_amount || 0;
      last7Days[orderDate].orders += 1;
    }
  });

  return Object.entries(last7Days).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Math.round(data.revenue * 100) / 100,
    orders: data.orders,
  }));
}

function calculateCategoryDistribution(products: Product[]) {
  const categories: { [key: string]: number } = {};

  products.forEach((product) => {
    const category = product.category || "Other";
    categories[category] = (categories[category] || 0) + 1;
  });

  return Object.entries(categories).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || categoryColors.Other,
  }));
}
