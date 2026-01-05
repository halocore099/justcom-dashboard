// API client for JUSTCOM backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://justcom-api-production.up.railway.app/api/v1";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Products
  async getProducts() {
    return this.request<{ products: any[] }>("/products");
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request<any>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  // Orders
  async getOrders() {
    return this.request<{ orders: any[] }>("/admin/orders");
  }

  async getOrder(id: string) {
    return this.request<any>(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Conversations/Messages
  async getConversations() {
    return this.request<{ conversations: any[] }>("/admin/conversations");
  }

  async getConversation(id: string) {
    return this.request<any>(`/admin/conversations/${id}`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request<any>(`/admin/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async updateConversationStatus(id: string, status: string) {
    return this.request<any>(`/admin/conversations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Analytics
  async getDashboardStats() {
    return this.request<any>("/admin/analytics/dashboard");
  }

  async getSalesData(period: string = "30d") {
    return this.request<any>(`/admin/analytics/sales?period=${period}`);
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<void>("/admin/logout", {
      method: "POST",
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
