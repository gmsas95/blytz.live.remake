import { useState, useEffect } from 'react';
import { productService, PaginatedResponse } from '../services/productService';
import { Product, ProductFilter } from '../types';

export const useProducts = (params?: ProductFilter) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProducts(params);
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [JSON.stringify(params)]);

  return { products, loading, error, refetch: loadProducts };
};

export const useFeaturedProducts = (limit = 8) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getFeaturedProducts(limit);
      setProducts(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
  }, [limit]);

  return { products, loading, error, refetch: loadFeaturedProducts };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProduct(id);
      setProduct(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  return { product, loading, error, refetch: loadProduct };
};

export const useSearchProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, params?: ProductFilter) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productService.searchProducts(query, params);
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, search };
};