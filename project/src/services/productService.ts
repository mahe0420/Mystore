import api from './api';
import { Product } from '../types';

export interface CreateProductData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
  status?: 'active' | 'inactive';
}

class ProductService {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      // First try MongoDB products
      const response = await api.get(`/products/${id}`);
      if (response.data.product) {
        return response.data.product;
      }
    } catch (error) {
      console.log('Product not found in MongoDB, trying external API...');
    }

    // Fallback to external API
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      if (response.ok) {
        const product = await response.json();
        return {
          ...product,
          isCustom: false,
          stock: 10 // Default stock for external products
        };
      }
    } catch (error) {
      console.error('Error fetching from external API:', error);
    }

    return null;
  }

  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const response = await api.post('/products', productData);
      return response.data.product;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  }

  async updateProduct(id: string, productData: Partial<CreateProductData>): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data.product;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await api.get(`/products?category=${category}`);
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
      return response.data.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

export const productService = new ProductService();