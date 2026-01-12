"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  ChevronDown,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { api, Conversation } from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";

const statusFilters = ["all", "open", "in_progress", "waiting", "resolved", "closed"];

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(113, 113, 122, 0.1)", text: "#71717a" },
  medium: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" },
  high: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
  urgent: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  open: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" },
  in_progress: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" },
  waiting: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
  resolved: { bg: "rgba(113, 113, 122, 0.1)", text: "#71717a" },
  closed: { bg: "rgba(82, 82, 91, 0.1)", text: "#52525b" },
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSelectConversation = async (conv: Conversation) => {
    setIsLoadingConversation(true);
    try {
      const fullConversation = await api.getConversation(conv.id);
      setSelectedConversation(fullConversation);
    } catch (err: any) {
      setError(err.message || "Failed to load conversation");
      setSelectedConversation(conv);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: conversations.length,
    open: conversations.filter((c) => c.status === "open").length,
    inProgress: conversations.filter((c) => c.status === "in_progress").length,
    unread: conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await api.sendMessage(selectedConversation.id, newMessage.trim());
      setNewMessage("");
      const updatedConv = await api.getConversation(selectedConversation.id);
      setSelectedConversation(updatedConv);
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedConversation) return;

    try {
      await api.updateConversationStatus(selectedConversation.id, status);
      await fetchConversations();
      setSelectedConversation({ ...selectedConversation, status: status as any });
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return format(date, "MMM d");
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
              Support
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: '4px 0 0 0' }}>Messages</h1>
          </div>
          <button
            onClick={fetchConversations}
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
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Total</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {stats.total}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Open</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {stats.open}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>In Progress</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#3b82f6', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {stats.inProgress}
          </p>
        </div>
        <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Unread</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f59e0b', fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
            {stats.unread}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ backgroundColor: '#16181d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', minHeight: 'calc(100vh - 340px)' }}>
          {/* Conversations List */}
          <div style={{ borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #27272a' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }}
                />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '36px',
                    paddingRight: '16px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: '#0f1117',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    appearance: 'none',
                    padding: '10px 32px 10px 12px',
                    backgroundColor: '#0f1117',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Status" : status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const priority = priorityColors[conv.priority] || priorityColors.low;
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #27272a',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#1c1e24'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#6366f1',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>
                            {conv.customer_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p style={{ fontWeight: 600, color: '#fafafa', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.customer_name}
                            </p>
                            {conv.unread_count > 0 && (
                              <span
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  fontSize: '10px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.subject}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: 500,
                                borderRadius: '6px',
                                backgroundColor: priority.bg,
                                color: priority.text,
                              }}
                            >
                              {conv.priority}
                            </span>
                            <span style={{ fontSize: '10px', color: '#52525b' }}>
                              {formatDate(conv.updated_at || conv.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', color: '#3f3f46', marginBottom: '16px' }}>💬</div>
                  <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                <div style={{ padding: '16px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#6366f1',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>
                        {selectedConversation.customer_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#fafafa', fontSize: '14px', margin: 0 }}>{selectedConversation.customer_name}</p>
                      <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0 0' }}>{selectedConversation.customer_email}</p>
                    </div>
                  </div>
                  {(() => {
                    const status = statusColors[selectedConversation.status] || statusColors.open;
                    return (
                      <select
                        value={selectedConversation.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: 'none',
                          backgroundColor: status.bg,
                          color: status.text,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {statusFilters.filter(s => s !== "all").map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ").charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '16px', backgroundColor: '#0f1117' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#27272a',
                        fontSize: '12px',
                        color: '#71717a',
                        borderRadius: '20px',
                      }}
                    >
                      {selectedConversation.subject}
                    </span>
                  </div>

                  {isLoadingConversation ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
                      <Loader2 size={24} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedConversation.messages.map((message, index) => {
                      const isAdmin = message.sender_type === "admin";
                      return (
                        <div key={message.id || index} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                          <div
                            style={{
                              maxWidth: '70%',
                              borderRadius: '16px',
                              borderBottomRightRadius: isAdmin ? '4px' : '16px',
                              borderBottomLeftRadius: isAdmin ? '16px' : '4px',
                              padding: '12px 16px',
                              backgroundColor: isAdmin ? '#3b82f6' : '#27272a',
                              color: isAdmin ? 'white' : '#fafafa',
                            }}
                          >
                            <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</p>
                            <p
                              style={{
                                fontSize: '10px',
                                marginTop: '4px',
                                color: isAdmin ? '#93c5fd' : '#52525b',
                                margin: '4px 0 0 0',
                              }}
                            >
                              {message.sender_name} · {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
                      <p style={{ fontSize: '13px', color: '#52525b' }}>No messages in this conversation</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Type your message..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: '#0f1117',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: '#fafafa',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                      style={{
                        padding: '12px',
                        backgroundColor: isSending || !newMessage.trim() ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: isSending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isSending ? (
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1117' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', color: '#3f3f46', marginBottom: '16px' }}>💬</div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', margin: 0 }}>Select a conversation</p>
                  <p style={{ fontSize: '13px', color: '#52525b', margin: '4px 0 0 0' }}>Choose from the list to view messages</p>
                </div>
              </div>
            )}
          </div>
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
