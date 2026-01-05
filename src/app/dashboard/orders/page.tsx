"use client";

import { useState } from "react";
import { Search, Filter, Eye, ChevronDown } from "lucide-react";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

// Mock orders data
const mockOrders = [
  {
    id: "ORD-2025-001",
    customer: { name: "Max Müller", email: "max@email.com" },
    items: 2,
    total: 1498.00,
    status: "processing",
    paymentStatus: "paid",
    date: "2025-01-05 14:32",
  },
  {
    id: "ORD-2025-002",
    customer: { name: "Anna Schmidt", email: "anna@email.com" },
    items: 1,
    total: 1299.00,
    status: "shipped",
    paymentStatus: "paid",
    date: "2025-01-05 11:15",
  },
  {
    id: "ORD-2025-003",
    customer: { name: "Thomas Weber", email: "thomas@email.com" },
    items: 3,
    total: 847.00,
    status: "pending",
    paymentStatus: "pending",
    date: "2025-01-04 18:45",
  },
  {
    id: "ORD-2025-004",
    customer: { name: "Lisa Fischer", email: "lisa@email.com" },
    items: 1,
    total: 899.00,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-01-04 09:20",
  },
  {
    id: "ORD-2025-005",
    customer: { name: "Jan Bauer", email: "jan@email.com" },
    items: 2,
    total: 348.00,
    status: "confirmed",
    paymentStatus: "paid",
    date: "2025-01-03 16:50",
  },
  {
    id: "ORD-2025-006",
    customer: { name: "Sarah Klein", email: "sarah@email.com" },
    items: 1,
    total: 499.00,
    status: "cancelled",
    paymentStatus: "refunded",
    date: "2025-01-03 12:30",
  },
  {
    id: "ORD-2025-007",
    customer: { name: "Peter Hoffmann", email: "peter@email.com" },
    items: 4,
    total: 2147.00,
    status: "delivered",
    paymentStatus: "paid",
    date: "2025-01-02 10:15",
  },
];

const statusFilters = ["All", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (order: typeof mockOrders[0]) => (
        <span className="font-medium text-gray-900">{order.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: typeof mockOrders[0]) => (
        <div>
          <p className="font-medium text-gray-900">{order.customer.name}</p>
          <p className="text-xs text-gray-500">{order.customer.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (order: typeof mockOrders[0]) => (
        <span>{order.items} item{order.items !== 1 ? "s" : ""}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order: typeof mockOrders[0]) => (
        <span className="font-medium">€{order.total.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: typeof mockOrders[0]) => (
        <StatusBadge status={order.status} variant="order" />
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (order: typeof mockOrders[0]) => (
        <StatusBadge status={order.paymentStatus} variant="default" />
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (order: typeof mockOrders[0]) => (
        <span className="text-gray-500">{order.date}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (order: typeof mockOrders[0]) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(order);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Eye size={16} className="text-gray-500" />
        </button>
      ),
      className: "w-12",
    },
  ];

  const orderStats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === "pending").length,
    processing: mockOrders.filter((o) => ["confirmed", "processing", "shipped"].includes(o.status)).length,
    completed: mockOrders.filter((o) => o.status === "delivered").length,
    revenue: mockOrders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage customer orders and fulfillment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-semibold mt-1">{orderStats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-semibold mt-1 text-yellow-600">{orderStats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold mt-1 text-blue-600">{orderStats.processing}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold mt-1 text-green-600">{orderStats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-semibold mt-1">€{orderStats.revenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        keyExtractor={(order) => order.id}
        onRowClick={(order) => setSelectedOrder(order)}
        emptyMessage="No orders found"
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedOrder.id}</h2>
                <p className="text-gray-500">{selectedOrder.date}</p>
              </div>
              <StatusBadge status={selectedOrder.status} variant="order" />
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
                <p className="text-sm">{selectedOrder.customer.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>Items ({selectedOrder.items})</span>
                  <span>€{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>€{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Update Status</h3>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {statusFilters.filter((s) => s !== "All").map((status) => (
                    <option key={status} value={status} selected={status === selectedOrder.status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
