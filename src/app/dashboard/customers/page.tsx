"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  Users,
  X,
  Mail,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Eye,
} from "lucide-react";
import { api, Customer, Order } from "@/lib/api";
import { format } from "date-fns";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<(Customer & { orders?: Order[] }) | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomerDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const data = await api.getCustomer(id);
      setSelectedCustomer(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const customerStats = {
    total: customers.length,
    totalSpent: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
    avgOrders: customers.length > 0
      ? (customers.reduce((sum, c) => sum + (c.order_count || 0), 0) / customers.length).toFixed(1)
      : 0,
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
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
              CRM
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Customers</h1>
          </div>
          <button
            onClick={fetchCustomers}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total Customers</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {customerStats.total}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total Revenue</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            €{customerStats.totalSpent.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Avg. Orders/Customer</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#3b82f6', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {customerStats.avgOrders}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
        <input
          type="text"
          placeholder="Search customers..."
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

      {/* Customers List */}
      {filteredCustomers.length > 0 ? (
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              onClick={() => fetchCustomerDetails(customer.id)}
              style={{
                padding: '20px',
                borderBottom: index < filteredCustomers.length - 1 ? '1px solid #27272a' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c1e24'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#fafafa', fontSize: '14px', margin: 0 }}>
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} />
                    {customer.email}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Orders</p>
                    <p style={{ fontWeight: 600, color: '#fafafa', fontSize: '14px', margin: '2px 0 0 0' }}>
                      {customer.order_count || 0}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total Spent</p>
                    <p style={{ fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', margin: '2px 0 0 0' }}>
                      €{(customer.total_spent || 0).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Joined</p>
                    <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '2px 0 0 0' }}>
                      {formatDate(customer.created_at)}
                    </p>
                  </div>
                  <Eye size={16} style={{ color: '#52525b' }} />
                </div>
              </div>
            </div>
          ))}
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
          <Users size={32} style={{ color: '#3f3f46', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', margin: 0 }}>No customers found</p>
          <p style={{ fontSize: '13px', color: '#52525b', margin: '4px 0 0 0' }}>
            {searchQuery ? "Try adjusting your search" : "Customers will appear here after their first order"}
          </p>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>
                    {selectedCustomer.first_name?.[0]}{selectedCustomer.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa', margin: 0 }}>
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#71717a', margin: '2px 0 0 0' }}>{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={18} style={{ color: '#71717a' }} />
              </button>
            </div>

            {loadingDetails ? (
              <div style={{ padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={24} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#0f1117', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <ShoppingBag size={20} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                    <p style={{ fontSize: '20px', fontWeight: 600, color: '#fafafa', margin: 0 }}>{selectedCustomer.order_count || 0}</p>
                    <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Orders</p>
                  </div>
                  <div style={{ backgroundColor: '#0f1117', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <TrendingUp size={20} style={{ color: '#10b981', marginBottom: '8px' }} />
                    <p style={{ fontSize: '20px', fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
                      €{(selectedCustomer.total_spent || 0).toFixed(0)}
                    </p>
                    <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Total Spent</p>
                  </div>
                  <div style={{ backgroundColor: '#0f1117', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <Calendar size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: 0 }}>{formatDate(selectedCustomer.created_at)}</p>
                    <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Member Since</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fafafa', margin: '0 0 12px 0' }}>Recent Orders</h3>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCustomer.orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: '#0f1117',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa', margin: 0 }}>{order.order_number}</p>
                          <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>{formatDate(order.created_at)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 500,
                              borderRadius: '6px',
                              backgroundColor: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: order.status === 'delivered' ? '#10b981' : '#3b82f6',
                            }}
                          >
                            {order.status}
                          </span>
                          <span style={{ fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px' }}>
                            €{order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#52525b', textAlign: 'center', padding: '24px' }}>No orders yet</p>
                )}
              </div>
            )}
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
