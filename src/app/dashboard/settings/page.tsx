"use client";

import { useState } from "react";
import { User, Bell, Shield, Store, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "store", label: "Store", icon: Store },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#71717a', textTransform: 'uppercase', margin: 0 }}>
          Configuration
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Settings</h1>
      </div>

      <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr' }}>
          {/* Sidebar */}
          <div style={{ padding: '20px', borderRight: '1px solid #27272a' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#a1a1aa',
                    textAlign: 'left',
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div style={{ padding: '28px' }}>
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Profile Settings</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#6366f1',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    AD
                  </div>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#a1a1aa',
                      cursor: 'pointer',
                    }}
                  >
                    Change Avatar
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        color: '#fafafa',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@justcom.de"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        color: '#fafafa',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+49 123 456 7890"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        color: '#fafafa',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Role
                    </label>
                    <input
                      type="text"
                      defaultValue="Administrator"
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        color: '#52525b',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Notification Preferences</h2>

                <div>
                  {[
                    { id: "orders", label: "New Orders", desc: "Get notified when a new order is placed" },
                    { id: "messages", label: "Customer Messages", desc: "Get notified when customers send messages" },
                    { id: "stock", label: "Low Stock Alerts", desc: "Get notified when products are running low" },
                    { id: "reviews", label: "Product Reviews", desc: "Get notified when customers leave reviews" },
                  ].map((item, index, arr) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderBottom: index < arr.length - 1 ? '1px solid #27272a' : 'none',
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 500, color: '#fafafa', fontSize: '14px', margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: '12px', color: '#52525b', margin: '2px 0 0 0' }}>{item.desc}</p>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }} />
                        <div
                          style={{
                            width: '40px',
                            height: '20px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '10px',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '16px',
                              height: '16px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                            }}
                          />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Security Settings</h2>

                <div>
                  <h3 style={{ fontWeight: 500, color: '#fafafa', fontSize: '14px', margin: '0 0 16px 0' }}>Change Password</h3>
                  <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: '#0f1117',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          color: '#fafafa',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: '#0f1117',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          color: '#fafafa',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: '#0f1117',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          color: '#fafafa',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'white',
                        cursor: 'pointer',
                        width: 'fit-content',
                      }}
                    >
                      Update Password
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #27272a', paddingTop: '24px' }}>
                    <h3 style={{ fontWeight: 500, color: '#fafafa', fontSize: '14px', margin: '0 0 8px 0' }}>Two-Factor Authentication</h3>
                    <p style={{ fontSize: '12px', color: '#52525b', margin: '0 0 16px 0' }}>
                      Add an extra layer of security to your account
                    </p>
                    <button
                      style={{
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
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "store" && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', margin: '0 0 24px 0' }}>Store Settings</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Store Name
                    </label>
                    <input
                      type="text"
                      defaultValue="JUSTCOM"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        color: '#fafafa',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Currency
                    </label>
                    <select
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
                      <option>EUR (€)</option>
                      <option>USD ($)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Timezone
                    </label>
                    <select
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
                      <option>Europe/Berlin (CET)</option>
                      <option>Europe/London (GMT)</option>
                      <option>America/New_York (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="19"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        color: '#fafafa',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
