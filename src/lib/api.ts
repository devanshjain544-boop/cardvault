import type { 
  User, Product, Category, Order, Coupon, StoreSettings, DashboardStats, Address 
} from '../types.js';

const TOKEN_KEY = 'cardvault_token';
const USER_KEY = 'cardvault_user';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(user: User, token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `Server error (${res.status})`;
      throw new Error(errorMsg);
    }

    return data as T;
  },

  // Store Settings & Metadata
  async getSettings(): Promise<StoreSettings> {
    return this.request<StoreSettings>('/api/settings');
  },

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  },

  async getProductTypes(): Promise<string[]> {
    return this.request<string[]>('/api/product-types');
  },

  // Products
  async getProducts(params?: Record<string, any>): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Product[]>(`/api/products${qs}`);
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    return this.request<Product>(`/api/products/${idOrSlug}`);
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
    return this.request('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setAuth(res.user, res.token);
    return res;
  },

  async adminLogin(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setAuth(res.user, res.token);
    return res;
  },

  async register(name: string, email: string, password: string, mobile?: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, mobile })
    });
    this.setAuth(res.user, res.token);
    return res;
  },

  async getMe(): Promise<User> {
    const res = await this.request<{ user: User }>('/api/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res.user;
  },

  async updateProfile(data: { name: string; mobile?: string }): Promise<User> {
    const res = await this.request<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    return res;
  },

  async saveAddress(address: Address): Promise<Address[]> {
    return this.request<Address[]>('/api/auth/address', {
      method: 'POST',
      body: JSON.stringify(address)
    });
  },

  // Payment & Orders
  async createPaymentOrder(
    itemsOrPayload: { productId: string; quantity: number }[] | { items: { productId: string; quantity: number }[]; couponCode?: string; shippingAddress?: any },
    couponCode?: string
  ): Promise<{
    gatewayOrderId: string;
    amount: number;
    amountInPaise: number;
    currency: string;
    keyId: string;
    isLiveGateway: boolean;
    isSandbox?: boolean;
    subtotal: number;
    shippingFee: number;
    discount: number;
    bankSettlement?: {
      accountHolderName: string;
      accountNumber: string;
      bankName: string;
      ifscCode: string;
      accountType: string;
      upiId: string;
    };
    upiPayUri?: string;
  }> {
    const body = Array.isArray(itemsOrPayload)
      ? { items: itemsOrPayload, couponCode }
      : itemsOrPayload;
    return this.request('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async verifyPayment(payload: {
    gatewayOrderId: string;
    paymentId: string;
    signature: string;
    shippingAddress: Address;
    items: { productId: string; quantity: number }[];
    couponCode?: string;
    paymentMethod?: string;
  }): Promise<{ order: Order; isDuplicate?: boolean }> {
    return this.request('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async configureGateway(payload: { keyId: string; keySecret: string; isLiveMode?: boolean }): Promise<{ success: boolean; message: string; keyId: string }> {
    return this.request('/api/payment/configure-gateway', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async cancelPaymentAttempt(gatewayOrderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/payment/cancel', {
      method: 'POST',
      body: JSON.stringify({ gatewayOrderId, reason })
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>('/api/orders/my-orders');
  },

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}`);
  },

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Admin APIs
  admin: {
    async getDashboard(): Promise<DashboardStats> {
      return api.request<DashboardStats>('/api/admin/dashboard');
    },

    async getDashboardStats(): Promise<DashboardStats> {
      return this.getDashboard();
    },

    async getProducts(params?: Record<string, any>): Promise<Product[]> {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
        });
      }
      return api.request<Product[]>(`/api/admin/products?${query.toString()}`);
    },

    async createProduct(data: any): Promise<Product> {
      return api.request<Product>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateProduct(id: string, data: any): Promise<Product> {
      return api.request<Product>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async deleteProduct(id: string): Promise<{ success: boolean }> {
      return api.request(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });
    },

    async uploadImage(dataUrl: string, filename?: string): Promise<{ url: string; filename: string }> {
      return api.request('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, filename })
      });
    },

    async getCategories(): Promise<Category[]> {
      return api.request<Category[]>('/api/admin/categories');
    },

    async createCategory(data: any): Promise<Category> {
      return api.request<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateCategory(id: string, data: any): Promise<Category> {
      return api.request<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async deleteCategory(id: string): Promise<{ success: boolean }> {
      return api.request(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });
    },

    async addProductType(typeName: string): Promise<string[]> {
      return api.request('/api/admin/product-types', {
        method: 'POST',
        body: JSON.stringify({ typeName })
      });
    },

    async getInventory(): Promise<{ items: any[]; lowStockThreshold: number }> {
      return api.request('/api/admin/inventory');
    },

    async updateStock(id: string, stock: number): Promise<Product> {
      return api.request(`/api/admin/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock })
      });
    },

    async getOrders(params?: Record<string, any>): Promise<Order[]> {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) query.set(k, String(v));
        });
      }
      return api.request<Order[]>(`/api/admin/orders?${query.toString()}`);
    },

    async updateOrderStatus(id: string, data: any): Promise<Order> {
      return api.request<Order>(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async getPayments(): Promise<any[]> {
      return api.request<any[]>('/api/admin/payments');
    },

    async getCustomers(): Promise<any[]> {
      return api.request<any[]>('/api/admin/customers');
    },

    async getCoupons(): Promise<Coupon[]> {
      return api.request<Coupon[]>('/api/admin/coupons');
    },

    async createCoupon(data: any): Promise<Coupon> {
      return api.request<Coupon>('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async toggleCoupon(id: string): Promise<Coupon> {
      return api.request<Coupon>(`/api/admin/coupons/${id}/toggle`, {
        method: 'PUT'
      });
    },

    async deleteCoupon(id: string): Promise<{ success: boolean }> {
      return api.request(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      });
    },

    async getSettings(): Promise<StoreSettings> {
      return api.request<StoreSettings>('/api/admin/settings');
    },

    async updateSettings(data: any): Promise<StoreSettings> {
      return api.request<StoreSettings>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async testPaymentConnection(): Promise<{ success: boolean; message: string; gatewayStatus?: string; bankVerified?: boolean }> {
      return api.request('/api/admin/payments/test-connection', {
        method: 'POST'
      });
    },

    async seedCatalog(): Promise<{ success: boolean; message: string }> {
      return api.request('/api/admin/seed-catalog', {
        method: 'POST'
      });
    }
  }
};
