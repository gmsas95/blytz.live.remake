import React from 'react';

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isFlash?: boolean;
  isHot?: boolean;
  timeLeft?: string; // For flash sales
  description?: string;
  sellerId?: string;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export type ViewState = 'HOME' | 'PRODUCT_DETAIL' | 'CHECKOUT' | 'LOGIN' | 'REGISTER' | 'DASHBOARD';

// Backend API Types
export interface ProductFilter {
  page?: number;
  limit?: number;
  category?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  status?: string;
  sort_by?: 'created_at' | 'price' | 'title';
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}