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
  dropDate?: string; // For upcoming drops
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export type ViewState = 'HOME' | 'PRODUCT_DETAIL' | 'CHECKOUT' | 'DROPS' | 'SELL' | 'ACCOUNT';