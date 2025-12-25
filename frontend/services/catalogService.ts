import { api } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  attributes?: CategoryAttribute[];
}

export interface CategoryAttribute {
  id: string;
  category_id: string;
  name: string;
  type: string;
  options?: string[];
  required: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  name: string;
  price?: number;
  compare_at_price?: number;
  stock: number;
  attributes: Record<string, string>;
  is_available: boolean;
}

export interface ProductCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryStock {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  reserved: number;
  available: number;
  low_stock_alert: number;
  last_updated: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  variant_id?: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  reason?: string;
  reference?: string;
  created_at: string;
}

export const catalogService = {
  // Categories
  async getCategories(params?: { parent_id?: string; depth?: number }): Promise<Category[]> {
    const response = await api.get('/catalog/categories', { params });
    return response.data.categories || response.data || [];
  },

  async getCategoryTree(params?: { depth?: number; include_inactive?: boolean }): Promise<Category[]> {
    const response = await api.get('/catalog/categories', { params });
    return response.data.categories || response.data || [];
  },

  async getCategory(id: string): Promise<Category> {
    const response = await api.get(`/catalog/categories/${id}`);
    return response.data;
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: string;
    sort_order?: number;
  }): Promise<Category> {
    const response = await api.post('/catalog/categories', data);
    return response.data;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await api.put(`/catalog/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/catalog/categories/${id}`);
  },

  async moveCategory(id: string, parent_id?: string, sort_order?: number): Promise<void> {
    await api.put(`/catalog/categories/${id}/move`, { parent_id, sort_order });
  },

  // Category Attributes
  async getCategoryAttributes(categoryId: string): Promise<CategoryAttribute[]> {
    const response = await api.get(`/catalog/categories/${categoryId}/attributes`);
    return response.data.attributes || response.data || [];
  },

  async createCategoryAttribute(categoryId: string, data: {
    name: string;
    type: string;
    options?: string[];
    required?: boolean;
  }): Promise<CategoryAttribute> {
    const response = await api.post(`/catalog/categories/${categoryId}/attributes`, data);
    return response.data;
  },

  async updateCategoryAttribute(attributeId: string, data: Partial<CategoryAttribute>): Promise<CategoryAttribute> {
    const response = await api.put(`/catalog/categories/attributes/${attributeId}`, data);
    return response.data;
  },

  async deleteCategoryAttribute(attributeId: string): Promise<void> {
    await api.delete(`/catalog/categories/attributes/${attributeId}`);
  },

  // Product Collections
  async getCollections(params?: { is_active?: boolean }): Promise<ProductCollection[]> {
    const response = await api.get('/catalog/collections', { params });
    return response.data.collections || response.data || [];
  },

  async getCollection(id: string): Promise<ProductCollection> {
    const response = await api.get(`/catalog/collections/${id}`);
    return response.data;
  },

  async createCollection(data: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
  }): Promise<ProductCollection> {
    const response = await api.post('/catalog/collections', data);
    return response.data;
  },

  async updateCollection(id: string, data: Partial<ProductCollection>): Promise<ProductCollection> {
    const response = await api.put(`/catalog/collections/${id}`, data);
    return response.data;
  },

  async deleteCollection(id: string): Promise<void> {
    await api.delete(`/catalog/collections/${id}`);
  },

  async addProductsToCollection(collectionId: string, productIds: string[]): Promise<void> {
    await api.post(`/catalog/collections/${collectionId}/products`, { product_ids: productIds });
  },

  async removeProductsFromCollection(collectionId: string, productIds: string[]): Promise<void> {
    await api.delete(`/catalog/collections/${collectionId}/products`, { data: { product_ids: productIds } });
  },

  // Product Variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const response = await api.get(`/catalog/variants/products/${productId}`);
    return response.data.variants || response.data || [];
  },

  async createVariant(productId: string, data: {
    sku?: string;
    name: string;
    price?: number;
    compare_at_price?: number;
    stock: number;
    attributes: Record<string, string>;
  }): Promise<ProductVariant> {
    const response = await api.post('/catalog/variants', { product_id: productId, variant: data });
    return response.data;
  },

  async updateVariant(id: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await api.put(`/catalog/variants/${id}`, data);
    return response.data;
  },

  async deleteVariant(id: string): Promise<void> {
    await api.delete(`/catalog/variants/${id}`);
  },

  // Inventory
  async getInventoryByProduct(productId: string): Promise<InventoryStock> {
    const response = await api.get(`/catalog/inventory/products/${productId}`);
    return response.data;
  },

  async getInventoryByVariant(variantId: string): Promise<InventoryStock> {
    const response = await api.get(`/catalog/inventory/variants/${variantId}`);
    return response.data;
  },

  async updateInventory(productId: string, data: {
    quantity: number;
    low_stock_alert?: number;
  }): Promise<InventoryStock> {
    const response = await api.put(`/catalog/inventory/products/${productId}`, data);
    return response.data;
  },

  async getStockMovements(productId: string, limit?: number): Promise<StockMovement[]> {
    const response = await api.get(`/catalog/inventory/products/${productId}/movements`, { params: { limit } });
    return response.data.movements || response.data || [];
  },

  async createStockMovement(productId: string, data: {
    type: 'in' | 'out' | 'adjustment' | 'return';
    quantity: number;
    reason?: string;
    reference?: string;
  }): Promise<StockMovement> {
    const response = await api.post(`/catalog/inventory/products/${productId}/movements`, data);
    return response.data;
  },

  async getLowStockProducts(): Promise<InventoryStock[]> {
    const response = await api.get('/catalog/inventory/low-stock');
    return response.data.products || response.data || [];
  },

  async getOutOfStockProducts(): Promise<InventoryStock[]> {
    const response = await api.get('/catalog/inventory/out-of-stock');
    return response.data.products || response.data || [];
  },

  // Catalog Stats
  async getCatalogStats(): Promise<any> {
    const response = await api.get('/catalog/stats/catalog');
    return response.data;
  },

  async getCategoryStats(categoryId: string): Promise<any> {
    const response = await api.get(`/catalog/stats/categories/${categoryId}`);
    return response.data;
  }
};
