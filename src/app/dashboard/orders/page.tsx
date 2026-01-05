"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  ChevronDown,
  Loader2,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  X,
  MapPin,
  Mail,
  User,
  ShoppingBag,
} from "lucide-react";
import { api, Order } from "@/lib/api";
import { format } from "date-fns";

const statusFilters = ["All", "pending", "processing", "shipped", "delivered", "cancelled"];

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setNewStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => ["processing", "shipped"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;

    setUpdatingStatus(true);
    try {
      await api.updateOrderStatus(selectedOrder.id, newStatus);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Manage customer orders and fulfillment</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Total Orders</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{orderStats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Pending</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{orderStats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{orderStats.processing}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{orderStats.completed}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Revenue</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {orderStats.revenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="p-4 sm:p-5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[order.status]?.split(" ")[0] || "bg-slate-100"}`}>
                        <StatusIcon size={20} className={statusColors[order.status]?.split(" ")[1] || "text-slate-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900">{order.order_number}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[order.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {order.customer_name || order.shipping_address?.name || "Customer"}
                          {order.customer_email && <span className="hidden sm:inline"> - {order.customer_email}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {order.currency === "EUR" ? "" : order.currency}{order.total_amount?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-slate-500">{order.items?.length || 0} items</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                      </div>
                      <Eye size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ShoppingBag size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No orders found</p>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? "Try adjusting your search" : "Orders will appear here when customers make purchases"}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedOrder.order_number}</h2>
                <p className="text-sm text-slate-500">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${statusColors[selectedOrder.status] || "bg-slate-100"}`}>
                {(() => {
                  const StatusIcon = statusIcons[selectedOrder.status] || Clock;
                  return <StatusIcon size={18} />;
                })()}
                <span className="font-medium">{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</span>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User size={18} />
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-slate-400" />
                    <span>{selectedOrder.customer_name || selectedOrder.shipping_address?.name || "N/A"}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-slate-400" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.street}</p>
                    <p>
                      {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                    </p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Package size={18} />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id || index} className="flex items-center gap-4 bg-white rounded-lg p-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{item.product_name}</p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">{item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900">{selectedOrder.total_amount?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping</span>
                    <span className="text-slate-900">Free</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{selectedOrder.currency === "EUR" ? "" : selectedOrder.currency}{selectedOrder.total_amount?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-slate-900 mb-4">Update Status</h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusFilters.filter((s) => s !== "All").map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus || newStatus === selectedOrder.status}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updatingStatus ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
