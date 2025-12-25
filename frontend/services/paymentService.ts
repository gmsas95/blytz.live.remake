import { api } from './api';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_account';
  provider: 'stripe' | 'paypal' | 'bank';
  method_ref: string;
  is_default: boolean;
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
  brand?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  client_secret?: string;
  payment_method_id?: string;
  created_at: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  payment_method_id?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
  payment_method_id?: string;
}

export const paymentService = {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/payments/methods');
    return response.data.methods || response.data || [];
  },

  async getUserPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/payments/methods');
    return response.data.methods || response.data || [];
  },

  async savePaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await api.post('/payments/methods', { payment_method_id: paymentMethodId });
    return response.data;
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await api.delete(`/payments/methods/${id}`);
  },

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const response = await api.post('/payments/intents', data);
    return response.data;
  },

  async getPaymentIntent(id: string): Promise<PaymentIntent> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentIntent> {
    const response = await api.post('/payments/confirm', data);
    return response.data;
  },

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    const response = await api.post('/admin/payments/refund', { payment_id: paymentId, amount });
    return response.data;
  },

  async getPayments(params?: { page?: number; limit?: number }): Promise<{ payments: any[]; total: number }> {
    const response = await api.get('/admin/payments', { params });
    return {
      payments: response.data.payments || response.data || [],
      total: response.data.total || 0
    };
  },

  async getPayment(id: string): Promise<any> {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  }
};
