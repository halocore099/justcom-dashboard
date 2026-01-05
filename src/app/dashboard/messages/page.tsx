"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MessageSquare,
  ChevronDown,
  Loader2,
  RefreshCw,
  X,
  User,
} from "lucide-react";
import { api, Conversation } from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";

const statusFilters = ["all", "open", "in_progress", "waiting", "resolved", "closed"];
const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  waiting: "bg-amber-100 text-amber-700",
  resolved: "bg-slate-100 text-slate-600",
  closed: "bg-slate-100 text-slate-500",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Communicate with customers</p>
        </div>
        <button
          onClick={fetchConversations}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Open</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.open}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Unread</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.unread}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <div className="border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Status" : status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-600">
                          {conv.customer_name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 truncate">{conv.customer_name}</p>
                          {conv.unread_count > 0 && (
                            <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">{conv.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[conv.priority] || priorityColors.low}`}>
                            {conv.priority}
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(conv.updated_at || conv.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare size={40} className="mx-auto text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-600">
                        {selectedConversation.customer_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedConversation.customer_name}</p>
                      <p className="text-xs text-slate-500">{selectedConversation.customer_email}</p>
                    </div>
                  </div>
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ${statusColors[selectedConversation.status] || statusColors.open}`}
                  >
                    {statusFilters.filter(s => s !== "all").map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 bg-white text-sm text-slate-600 rounded-full border border-slate-200">
                      {selectedConversation.subject}
                    </span>
                  </div>

                  {selectedConversation.messages?.map((message, index) => {
                    const isAdmin = message.sender_type === "admin";
                    return (
                      <div key={message.id || index} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            isAdmin
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-slate-900 border border-slate-200 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${isAdmin ? "text-blue-200" : "text-slate-400"}`}>
                            {message.sender_name} - {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                      className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto text-slate-300" />
                  <p className="mt-4 font-medium text-slate-900">Select a conversation</p>
                  <p className="text-sm text-slate-500 mt-1">Choose from the list to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
