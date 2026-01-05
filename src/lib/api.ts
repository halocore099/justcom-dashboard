// API client for JUSTCOM backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://justcom-api-production.up.railway.app/api/v1";

// Token storage keys
const ACCESS_TOKEN_KEY = "justcom_access_token";
const REFRESH_TOKEN_KEY = "justcom_refresh_token";
const USER_KEY = "justcom_user";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  health_rating: number;
  category: string;
  is_featured: boolean;
  urgency_badge?: string;
  stock_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  currency: string;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  // Extended fields for admin view
  customer_email?: string;
  customer_name?: string;
}

export interface Message {
  id: string;
  sender_type: "customer" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  related_order_id?: string;
  messages: Message[];
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  total_products: number;
  low_stock_products: number;
  open_conversations: number;
  avg_response_time: number;
}

export interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  date: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setTokens(accessToken: string, refreshToken: string, user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getAccessToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && retry) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, options, false);
      }
      // Refresh failed, clear tokens and throw
      this.clearTokens();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      const apiError: ApiError = {
        message: error.message || error.error || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
      throw apiError;
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text);
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const user = this.getUser();
      if (data.access_token && user) {
        this.setTokens(data.access_token, refreshToken, user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.setTokens(response.access_token, response.refresh_token, response.user);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>("/auth/logout", { method: "POST" });
    } finally {
      this.clearTokens();
    }
  }

  // Products
  async getProducts(params?: { category?: string; featured?: boolean }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.featured) searchParams.set("featured", "true");

    const query = searchParams.toString();
    const endpoint = query ? `/products?${query}` : "/products";

    const response = await this.request<{ products: Product[] } | Product[]>(endpoint);
    return Array.isArray(response) ? response : response.products || [];
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await this.request<{ orders: Order[] } | Order[]>("/admin/orders");
    return Array.isArray(response) ? response : response.orders || [];
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Conversations/Messages
  async getConversations(): Promise<Conversation[]> {
    const response = await this.request<{ conversations: Conversation[] } | Conversation[]>("/admin/conversations");
    return Array.isArray(response) ? response : response.conversations || [];
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.request<Conversation>(`/admin/conversations/${id}`);
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return this.request<Message>(`/admin/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async updateConversationStatus(id: string, status: string): Promise<Conversation> {
    return this.request<Conversation>(`/admin/conversations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/admin/analytics/dashboard");
  }

  async getSalesData(period: string = "30d"): Promise<SalesData[]> {
    const response = await this.request<{ data: SalesData[] } | SalesData[]>(
      `/admin/analytics/sales?period=${period}`
    );
    return Array.isArray(response) ? response : response.data || [];
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
