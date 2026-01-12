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
  Hash,
  Save,
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

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
  processing: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" },
  shipped: { bg: "rgba(99, 102, 241, 0.1)", text: "#6366f1" },
  delivered: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" },
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
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
  const [itemEdits, setItemEdits] = useState<Record<string, { article_number: string; product_number: string }>>({});
  const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});

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
      // Initialize item edits with current values
      const edits: Record<string, { article_number: string; product_number: string }> = {};
      selectedOrder.items?.forEach((item) => {
        edits[item.id] = {
          article_number: item.article_number || "",
          product_number: item.product_number || "",
        };
      });
      setItemEdits(edits);
      setSavingItems({});
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

  const handleSaveItemNumbers = async (itemId: string) => {
    if (!selectedOrder) return;

    const edit = itemEdits[itemId];
    if (!edit) return;

    setSavingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await api.updateOrderItem(selectedOrder.id, itemId, {
        article_number: edit.article_number || undefined,
        product_number: edit.product_number || undefined,
      });
      await fetchOrders();
      // Update selected order with new data
      const updatedOrder = orders.find((o) => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update item numbers");
    } finally {
      setSavingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleItemEditChange = (itemId: string, field: "article_number" | "product_number", value: string) => {
    setItemEdits((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
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
              Fulfillment
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Orders</h1>
          </div>
          <button
            onClick={fetchOrders}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#a1a1aa',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total Orders</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {orderStats.total}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Pending</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f59e0b', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {orderStats.pending}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>In Progress</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#3b82f6', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {orderStats.processing}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Completed</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {orderStats.completed}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Revenue</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            €{orderStats.revenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }}
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '44px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '10px',
              color: '#fafafa',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              appearance: 'none',
              padding: '12px 40px 12px 16px',
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '10px',
              color: '#fafafa',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
          {filteredOrders.map((order, index) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            const colors = statusColors[order.status] || { bg: "rgba(113, 113, 122, 0.1)", text: "#71717a" };
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                style={{
                  padding: '20px',
                  borderBottom: index < filteredOrders.length - 1 ? '1px solid #27272a' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c1e24'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.bg,
                      }}
                    >
                      <StatusIcon size={18} style={{ color: colors.text }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 600, color: '#fafafa', fontSize: '14px', margin: 0 }}>{order.order_number}</p>
                        <span
                          style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 500,
                            borderRadius: '6px',
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
                        {order.customer_name || order.shipping_address?.name || "Customer"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', margin: 0 }}>
                        €{order.total_amount?.toFixed(2) || "0.00"}
                      </p>
                      <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0 0' }}>{order.items?.length || 0} items</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>{formatDate(order.created_at)}</p>
                    </div>
                    <Eye size={16} style={{ color: '#52525b' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#16181d',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', color: '#3f3f46', marginBottom: '16px' }}>🛒</div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', margin: 0 }}>No orders found</p>
          <p style={{ fontSize: '13px', color: '#52525b', margin: '4px 0 0 0' }}>
            {searchQuery ? "Try adjusting your search" : "Orders will appear here when customers make purchases"}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa', margin: 0 }}>{selectedOrder.order_number}</h2>
                <p style={{ fontSize: '12px', color: '#52525b', margin: '2px 0 0 0' }}>{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <X size={18} style={{ color: '#71717a' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {/* Status Badge */}
              {(() => {
                const colors = statusColors[selectedOrder.status] || { bg: "rgba(113, 113, 122, 0.1)", text: "#71717a" };
                const StatusIcon = statusIcons[selectedOrder.status] || Clock;
                return (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: colors.bg,
                      marginBottom: '20px',
                    }}
                  >
                    <StatusIcon size={16} style={{ color: colors.text }} />
                    <span style={{ fontWeight: 500, fontSize: '13px', color: colors.text }}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                );
              })()}

              {/* Customer Info */}
              <div style={{ backgroundColor: '#0f1117', borderRadius: '12px', padding: '20px', border: '1px solid #27272a', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 600, color: '#fafafa', fontSize: '13px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} style={{ color: '#71717a' }} />
                  Customer Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <User size={12} style={{ color: '#52525b' }} />
                    <span style={{ color: '#a1a1aa' }}>{selectedOrder.customer_name || selectedOrder.shipping_address?.name || "N/A"}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Mail size={12} style={{ color: '#52525b' }} />
                      <span style={{ color: '#a1a1aa' }}>{selectedOrder.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div style={{ backgroundColor: '#0f1117', borderRadius: '12px', padding: '20px', border: '1px solid #27272a', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 600, color: '#fafafa', fontSize: '13px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: '#71717a' }} />
                    Shipping Address
                  </h3>
                  <div style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{selectedOrder.shipping_address.name}</p>
                    <p style={{ margin: 0 }}>{selectedOrder.shipping_address.street}</p>
                    <p style={{ margin: 0 }}>
                      {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                    </p>
                    <p style={{ margin: 0 }}>{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div style={{ backgroundColor: '#0f1117', borderRadius: '12px', padding: '20px', border: '1px solid #27272a', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 600, color: '#fafafa', fontSize: '13px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={14} style={{ color: '#71717a' }} />
                    Order Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id || index} style={{ backgroundColor: '#16181d', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#27272a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                            ) : (
                              <Package size={16} style={{ color: '#52525b' }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 500, color: '#fafafa', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                            <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0 0' }}>Qty: {item.quantity}</p>
                          </div>
                          <p style={{ fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', margin: 0 }}>€{item.total_price.toFixed(2)}</p>
                        </div>
                        {/* Article & Product Number Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>
                              <Hash size={10} />
                              Article Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., ART-12345"
                              value={itemEdits[item.id]?.article_number || ""}
                              onChange={(e) => handleItemEditChange(item.id, "article_number", e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                backgroundColor: '#0f1117',
                                border: '1px solid #27272a',
                                borderRadius: '6px',
                                color: '#fafafa',
                                fontSize: '12px',
                                fontFamily: '"JetBrains Mono", monospace',
                                outline: 'none',
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>
                              <Hash size={10} />
                              Product Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., PRD-67890"
                              value={itemEdits[item.id]?.product_number || ""}
                              onChange={(e) => handleItemEditChange(item.id, "product_number", e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                backgroundColor: '#0f1117',
                                border: '1px solid #27272a',
                                borderRadius: '6px',
                                color: '#fafafa',
                                fontSize: '12px',
                                fontFamily: '"JetBrains Mono", monospace',
                                outline: 'none',
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleSaveItemNumbers(item.id)}
                            disabled={savingItems[item.id]}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: savingItems[item.id] ? 'rgba(16, 185, 129, 0.5)' : '#10b981',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'white',
                              cursor: savingItems[item.id] ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              height: '34px',
                            }}
                          >
                            {savingItems[item.id] ? (
                              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Save size={12} />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div style={{ backgroundColor: '#0f1117', borderRadius: '12px', padding: '20px', border: '1px solid #27272a', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 600, color: '#fafafa', fontSize: '13px', margin: '0 0 16px 0' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717a' }}>Subtotal</span>
                    <span style={{ color: '#a1a1aa', fontFamily: '"JetBrains Mono", monospace' }}>€{selectedOrder.total_amount?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717a' }}>Shipping</span>
                    <span style={{ color: '#a1a1aa' }}>Free</span>
                  </div>
                  <div style={{ borderTop: '1px solid #27272a', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span style={{ color: '#fafafa' }}>Total</span>
                    <span style={{ color: '#fafafa', fontFamily: '"JetBrains Mono", monospace' }}>€{selectedOrder.total_amount?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h3 style={{ fontWeight: 600, color: '#fafafa', fontSize: '13px', margin: '0 0 12px 0' }}>Update Status</h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#0f1117',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
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
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #27272a',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#27272a',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#a1a1aa',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus || newStatus === selectedOrder.status}
                style={{
                  padding: '10px 20px',
                  backgroundColor: updatingStatus || newStatus === selectedOrder.status ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'white',
                  cursor: updatingStatus || newStatus === selectedOrder.status ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {updatingStatus ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
