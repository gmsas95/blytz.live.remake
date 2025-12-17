import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { cartService } from '../services/cartService';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isCartOpen: boolean;
  
  // Actions
  setIsLoading: (loading: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  
  // Cart operations
  loadCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Getters
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isCartOpen: false,

      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsCartOpen: (open) => set({ isCartOpen: open }),

      loadCart: async () => {
        set({ isLoading: true });
        try {
          const items = await cartService.getCart();
          set({ items });
        } catch (error) {
          console.error('Failed to load cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        set({ isLoading: true });
        try {
          await cartService.addToCart(product.id, quantity);
          const items = await cartService.getCart();
          set({ items });
        } catch (error) {
          console.error('Failed to add item to cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (productId) => {
        set({ isLoading: true });
        try {
          await cartService.removeFromCart(productId);
          const items = await cartService.getCart();
          set({ items });
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({ isLoading: true });
        try {
          await cartService.updateItemQuantity(productId, quantity);
          const items = await cartService.getCart();
          set({ items });
        } catch (error) {
          console.error('Failed to update item quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartService.clearCart();
          set({ items: [] });
        } catch (error) {
          console.error('Failed to clear cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);