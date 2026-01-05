// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  healthRating: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  healthRating: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Customer Communication types
export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  relatedOrderId?: string;
  relatedRepairId?: string;
  status: ConversationStatus;
  priority: Priority;
  assignedTo?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "customer" | "employee";
  content: string;
  attachments?: string[];
  createdAt: string;
  isRead: boolean;
}

export type ConversationStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "urgent";

// Analytics types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  lowStockProducts: number;
  openConversations: number;
  avgResponseTime: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  percentage: number;
}

// User/Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = "admin" | "manager" | "employee";
