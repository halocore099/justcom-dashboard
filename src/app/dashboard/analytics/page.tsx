"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Euro,
  ShoppingCart,
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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const chartData = salesData.length > 0 ? salesData : generateChartData(orders);
  const categoryData = calculateCategoryDistribution(products);
  const topProducts = [...products].sort((a, b) => b.price - a.price).slice(0, 5);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Loader2
          size={32}
          style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a', textTransform: 'uppercase', margin: 0 }}>
              Insights
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Analytics</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={fetchData}
              style={{
                padding: '10px',
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '10px',
                color: '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedRange === range.value ? '#3b82f6' : '#27272a',
                    color: selectedRange === range.value ? 'white' : '#a1a1aa',
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total Revenue</p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
                €{totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0 0' }}>
                <TrendingUp size={12} /> From {totalOrders} orders
              </p>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Euro size={18} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total Orders</p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
                {totalOrders}
              </p>
              <p style={{ fontSize: '11px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0 0' }}>
                <TrendingUp size={12} /> {deliveredOrders} delivered
              </p>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={18} style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Avg. Order Value</p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
                €{avgOrderValue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: '11px', color: '#52525b', margin: '4px 0 0 0' }}>Per transaction</p>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={18} style={{ color: '#6366f1' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Products</p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
                {products.length}
              </p>
              <p style={{ fontSize: '11px', color: '#f59e0b', margin: '4px 0 0 0' }}>
                {products.filter((p) => p.is_active).length} active
              </p>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={18} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Revenue Chart */}
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Revenue Overview</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16181d",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#52525b', fontSize: '13px', margin: 0 }}>No data available</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Products by Category</h3>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#16181d",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fafafa" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryData.map((cat) => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                        }}
                      />
                      <span style={{ color: '#a1a1aa' }}>{cat.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace' }}>{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#52525b', fontSize: '13px', margin: 0 }}>No products available</p>
            </div>
          )}
        </div>
      </div>

      {/* Orders Chart & Top Products */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        {/* Orders Chart */}
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Orders per Day</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16181d",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#52525b', fontSize: '13px', margin: 0 }}>No data available</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Top Products</h3>
          {topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.map((product, index) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#27272a',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#a1a1aa',
                    }}
                  >
                    {index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, color: '#fafafa', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0 0' }}>{product.category}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', margin: 0 }}>€{product.price.toFixed(2)}</p>
                    <p style={{ fontSize: '10px', color: '#52525b', margin: '2px 0 0 0' }}>{product.stock_count} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#52525b', fontSize: '13px', margin: 0 }}>No products available</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

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
