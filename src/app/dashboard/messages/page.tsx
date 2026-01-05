"use client";

import { useState } from "react";
import { Search, Send, User, Clock, Tag } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

// Mock conversations data
const mockConversations = [
  {
    id: "CONV-001",
    customer: { name: "Max Müller", email: "max@email.com" },
    subject: "Order status inquiry - ORD-2025-001",
    status: "open",
    priority: "high",
    relatedOrderId: "ORD-2025-001",
    lastMessage: "Hello, I wanted to check on the status of my order...",
    lastMessageTime: "10 min ago",
    unreadCount: 2,
    messages: [
      { id: "1", sender: "customer", name: "Max Müller", content: "Hello, I wanted to check on the status of my order. It's been a few days and I haven't received any updates.", time: "2025-01-05 14:22" },
      { id: "2", sender: "customer", name: "Max Müller", content: "The order number is ORD-2025-001. Can you please check?", time: "2025-01-05 14:23" },
    ],
  },
  {
    id: "CONV-002",
    customer: { name: "Sarah Klein", email: "sarah@email.com" },
    subject: "Return request for iPhone 13",
    status: "in_progress",
    priority: "medium",
    lastMessage: "I would like to return the iPhone 13 I purchased...",
    lastMessageTime: "25 min ago",
    unreadCount: 0,
    messages: [
      { id: "1", sender: "customer", name: "Sarah Klein", content: "I would like to return the iPhone 13 I purchased last week. It's not what I expected.", time: "2025-01-05 13:55" },
      { id: "2", sender: "employee", name: "Support Team", content: "Hello Sarah, I'm sorry to hear that. Could you please tell me more about the issue?", time: "2025-01-05 14:10" },
    ],
  },
  {
    id: "CONV-003",
    customer: { name: "Peter Hoffmann", email: "peter@email.com" },
    subject: "Question about MacBook warranty",
    status: "waiting",
    priority: "low",
    lastMessage: "Does the refurbished MacBook come with warranty?",
    lastMessageTime: "1 hour ago",
    unreadCount: 1,
    messages: [
      { id: "1", sender: "customer", name: "Peter Hoffmann", content: "Does the refurbished MacBook come with warranty?", time: "2025-01-05 13:15" },
    ],
  },
  {
    id: "CONV-004",
    customer: { name: "Anna Schmidt", email: "anna@email.com" },
    subject: "Shipping delay complaint",
    status: "resolved",
    priority: "high",
    lastMessage: "Thank you for resolving this issue!",
    lastMessageTime: "2 hours ago",
    unreadCount: 0,
    messages: [
      { id: "1", sender: "customer", name: "Anna Schmidt", content: "My order was supposed to arrive yesterday but I still haven't received it!", time: "2025-01-05 10:00" },
      { id: "2", sender: "employee", name: "Support Team", content: "I apologize for the delay. Let me check on this for you.", time: "2025-01-05 10:15" },
      { id: "3", sender: "employee", name: "Support Team", content: "I've tracked your package and it will be delivered today. I've also applied a 10% discount to your next order.", time: "2025-01-05 10:30" },
      { id: "4", sender: "customer", name: "Anna Schmidt", content: "Thank you for resolving this issue!", time: "2025-01-05 12:00" },
    ],
  },
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    // In a real app, this would call the API
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Communicate with customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Conversations</p>
          <p className="text-2xl font-semibold mt-1">{mockConversations.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-semibold mt-1 text-blue-600">
            {mockConversations.filter((c) => c.status === "open").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold mt-1 text-yellow-600">
            {mockConversations.filter((c) => c.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Unread Messages</p>
          <p className="text-2xl font-semibold mt-1 text-red-600">
            {mockConversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
          {/* Conversation List */}
          <div className="border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {["all", "open", "in_progress", "resolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      statusFilter === status
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all" ? "All" : status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm">{conv.customer.name}</p>
                    <div className="flex items-center gap-2">
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                      <StatusBadge status={conv.priority} variant="priority" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{conv.subject}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={conv.status} variant="conversation" />
                    <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.subject}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {selectedConversation.customer.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={14} />
                          {selectedConversation.id}
                        </span>
                      </div>
                    </div>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "employee" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "employee"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-75">{message.name}</p>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.sender === "employee" ? "text-blue-200" : "text-gray-400"}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={18} />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
