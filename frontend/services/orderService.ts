import { api } from './api';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
  product?: {
    id: string;
    title: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_id?: string;
  tracking_number?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  shipping_address: {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  billing_address: {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  notes?: string;
}

export interface OrderStatistics {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  average_order_value: number;
}

export const orderService = {
  async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{ orders: Order[]; total: number }> {
    const response = await api.get('/orders', { params });
    return {
      orders: response.data.orders || response.data || [],
      total: response.data.total || 0
    };
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  async getOrderStatistics(): Promise<OrderStatistics> {
    const response = await api.get('/admin/orders/statistics');
    return response.data;
  }
};
