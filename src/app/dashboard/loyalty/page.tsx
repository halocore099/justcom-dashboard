"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  Gift,
  X,
  Ticket,
  Crown,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import { api, LoyaltyVoucher } from "@/lib/api";
import { format } from "date-fns";

export default function LoyaltyPage() {
  const [vouchers, setVouchers] = useState<LoyaltyVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_points_issued: 0,
    total_vouchers_redeemed: 0,
    premium_subscribers: 0,
  });

  const fetchVouchers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vouchersData, statsData] = await Promise.all([
        api.getVouchers(),
        api.getLoyaltyStats(),
      ]);
      setVouchers(vouchersData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load loyalty data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" },
    used: { bg: "rgba(113, 113, 122, 0.1)", text: "#71717a" },
    expired: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
  };

  const voucherStats = {
    total: vouchers.length,
    active: vouchers.filter((v) => v.status === "active").length,
    used: vouchers.filter((v) => v.status === "used").length,
    totalValue: vouchers.filter((v) => v.status === "active").reduce((sum, v) => sum + v.value, 0),
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
              Rewards
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Loyalty & Vouchers</h1>
          </div>
          <button
            onClick={fetchVouchers}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={16} style={{ color: '#3b82f6' }} />
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Points Issued</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
            {stats.total_points_issued.toLocaleString()}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Ticket size={16} style={{ color: '#10b981' }} />
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Active Vouchers</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
            {voucherStats.active}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Gift size={16} style={{ color: '#f59e0b' }} />
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Outstanding Value</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f59e0b', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
            €{voucherStats.totalValue.toFixed(2)}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Crown size={16} style={{ color: '#a855f7' }} />
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Premium Members</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#a855f7', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
            {stats.premium_subscribers}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
          <input
            type="text"
            placeholder="Search vouchers..."
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {["all", "active", "used", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '10px 16px',
                backgroundColor: statusFilter === status ? '#3b82f6' : '#27272a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: statusFilter === status ? 'white' : '#a1a1aa',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers List */}
      {filteredVouchers.length > 0 ? (
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #27272a' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points Cost</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expires</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher, index) => {
                const colors = statusColors[voucher.status] || statusColors.active;
                return (
                  <tr
                    key={voucher.id}
                    style={{ borderBottom: index < filteredVouchers.length - 1 ? '1px solid #27272a' : 'none' }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', backgroundColor: '#27272a', padding: '4px 8px', borderRadius: '6px' }}>
                          {voucher.code}
                        </code>
                        <button
                          onClick={() => copyCode(voucher.code)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          {copiedCode === voucher.code ? (
                            <Check size={14} style={{ color: '#10b981' }} />
                          ) : (
                            <Copy size={14} style={{ color: '#52525b' }} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '13px', color: '#fafafa', margin: 0 }}>{voucher.customer_name || 'N/A'}</p>
                      <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0 0' }}>{voucher.customer_email || ''}</p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace' }}>
                        €{voucher.value.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{voucher.points_cost} pts</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 500,
                          borderRadius: '6px',
                          backgroundColor: colors.bg,
                          color: colors.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', color: '#71717a' }}>{formatDate(voucher.expires_at)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          <Ticket size={32} style={{ color: '#3f3f46', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', margin: 0 }}>No vouchers found</p>
          <p style={{ fontSize: '13px', color: '#52525b', margin: '4px 0 0 0' }}>
            {searchQuery ? "Try adjusting your search" : "Vouchers will appear here when customers redeem points"}
          </p>
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
