import { api } from './api';
import { Product, ProductFilter } from '../types';

export interface BackendProduct {
  id: string;
  title: string;
  description?: string;
  starting_price: number;
  buy_now_price?: number;
  original_price?: number;
  condition: string;
  status: string;
  images: string[];
  category_id: string;
  seller_id: string;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
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

// Transform backend product to frontend product format
export const transformProduct = (backendProduct: BackendProduct): Product => {
  return {
    id: backendProduct.id,
    title: backendProduct.title,
    price: backendProduct.buy_now_price || backendProduct.starting_price,
    originalPrice: backendProduct.original_price,
    rating: 4.5 + Math.random(), // Mock rating since backend doesn't have ratings
    reviews: Math.floor(Math.random() * 1000) + 10, // Mock reviews
    image: backendProduct.images[0] || 'https://picsum.photos/400/400?random=1',
    category: backendProduct.category?.name || 'Tech',
    isFlash: Math.random() > 0.8, // Random flash sales
    isHot: backendProduct.featured,
    description: backendProduct.description,
    sellerId: backendProduct.seller_id,
    seller: backendProduct.seller
  };
};

export const productService = {
  async getProducts(params?: ProductFilter): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/products', { params });
      const transformedProducts = response.data.products?.map(transformProduct) || [];
      
      return {
        data: transformedProducts,
        success: true,
        total: response.data.total || transformedProducts.length
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to fetch products'
      };
    }
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${id}`);
      return transformProduct(response.data.product || response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  async searchProducts(query: string, params?: ProductFilter): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/catalog/search/products', {
        params: { q: query, ...params }
      });
      const transformedProducts = response.data.data?.map(transformProduct) || [];
      
      return {
        data: transformedProducts,
        success: true,
        total: response.data.total || transformedProducts.length
      };
    } catch (error) {
      console.error('Failed to search products:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to search products'
      };
    }
  },

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    try {
      const response = await api.get('/catalog/search/products/featured', {
        params: { limit }
      });
      return response.data.data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  },

  async getRelatedProducts(id: string, limit = 6): Promise<Product[]> {
    try {
      const response = await api.get(`/catalog/search/products/${id}/related`, {
        params: { limit }
      });
      return response.data.data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      return [];
    }
  }
};