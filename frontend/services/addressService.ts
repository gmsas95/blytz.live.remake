import { api } from './api';

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  label: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  type: 'shipping' | 'billing';
  label: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/addresses');
    return response.data.addresses || response.data || [];
  },

  async getAddress(id: string): Promise<Address> {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  async updateAddress(id: string, data: Partial<CreateAddressRequest>): Promise<Address> {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await api.put(`/addresses/${id}/default`);
    return response.data;
  }
};
