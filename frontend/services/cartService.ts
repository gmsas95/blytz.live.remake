import { api } from './api';
import { CartItem } from '../types';

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  variant_id?: string;
}

export interface BackendCartItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
  quantity: number;
  created_at: string;
}

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get('/cart');
      const backendItems = response.data.items || response.data.cart?.items || [];
      
      return backendItems.map((item: BackendCartItem) => ({
        id: item.product_id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || 'https://picsum.photos/400/400?random=1'
      }));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      return [];
    }
  },

  async addToCart(productId: string, quantity: number): Promise<void> {
    await api.post('/cart/items', {
      product_id: productId,
      quantity
    });
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    await api.put(`/cart/items/${itemId}`, { quantity });
  },

  async removeFromCart(itemId: string): Promise<void> {
    await api.delete(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },

  async mergeCart(cartToken?: string): Promise<void> {
    await api.post('/cart/merge', { cart_token: cartToken });
  }
};