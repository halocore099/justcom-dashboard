"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Package, MessageSquare, TrendingUp, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#0f1117',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #27272a',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const quickStats = [
    { label: "Products", value: "2.4k+", icon: Package, color: "#6366f1" },
    { label: "Orders", value: "98%", sublabel: "accuracy", icon: ShoppingCart, color: "#10b981" },
    { label: "Messages", value: "<2h", sublabel: "response", icon: MessageSquare, color: "#f59e0b" },
    { label: "Analytics", value: "Live", icon: TrendingUp, color: "#ec4899" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        body { margin: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        input::placeholder { color: #52525b; }
        input:focus { outline: none; }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#0f1117',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        {/* Left Panel - Brand */}
        <div
          style={{
            display: 'none',
            width: '50%',
            padding: '48px',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f1117 0%, #1e293b 100%)',
          }}
          className="left-panel"
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              }}
            >
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>JC</span>
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.5px' }}>JUSTCOM</span>
              <span style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Admin Portal</span>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <h1 style={{ fontSize: '44px', fontWeight: 700, color: '#fafafa', margin: 0, lineHeight: 1.2, letterSpacing: '-1px' }}>
              Your store,
              <br />
              <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                under control.
              </span>
            </h1>
            <p style={{ fontSize: '16px', color: '#71717a', marginTop: '20px', maxWidth: '400px', lineHeight: 1.6 }}>
              Manage products, process orders, and connect with customers — all from one powerful dashboard.
            </p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '48px' }}>
              {quickStats.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '18px 20px',
                    backgroundColor: '#16181d',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${stat.color}15`,
                    }}
                  >
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace' }}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div>
            <p style={{ fontSize: '12px', color: '#52525b', margin: 0 }}>
              &copy; {new Date().getFullYear()} JUSTCOM GmbH. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease forwards' }}>
            {/* Mobile Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '48px',
              }}
              className="mobile-logo"
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}
              >
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>JC</span>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.5px' }}>JUSTCOM</span>
            </div>

            {/* Form Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>
                Admin Portal
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: 0 }}>Welcome back</h2>
              <p style={{ fontSize: '14px', color: '#71717a', marginTop: '8px' }}>Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '10px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#fca5a5' }}>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@justcom.de"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#16181d',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#fafafa',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#27272a';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 16px',
                      backgroundColor: '#16181d',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#fafafa',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#27272a';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: '#52525b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#71717a' }}>Remember me</span>
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: '13px',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span style={{ fontSize: '16px' }}>→</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #27272a' }}>
              <p style={{ fontSize: '12px', color: '#52525b', textAlign: 'center', margin: 0 }}>
                Employee access only. Having trouble?{" "}
                <a href="mailto:it@justcom.de" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                  Contact IT
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media query styles for responsive design */}
      <style>{`
        @media (min-width: 1024px) {
          .left-panel {
            display: flex !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
