// Backend API Service
const API_BASE_URL = 'http://localhost:8080/api/v1';

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
  timeLeft?: string;
  description?: string;
  dropDate?: string;
}

class ApiService {
  private getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Products
  async getProducts(category?: string): Promise<Product[]> {
    try {
      const url = category 
        ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/products`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if backend not available
      return this.getMockProducts();
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return this.getMockProducts().find(p => p.id === id) || null;
    }
  }

  // Categories
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to mock categories
      return this.getMockCategories();
    }
  }

  // Cart
  async getCart() {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  async addToCart(productId: string, quantity: number = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ productId, quantity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to local storage
      this.addToCartLocal(productId, quantity);
    }
  }

  // Auth
  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, name: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Fallback mock data for development
  private getMockProducts(): Product[] {
    return [
      {
        id: '1',
        title: 'NeonX Runner Vapor',
        price: 149.99,
        originalPrice: 220.00,
        rating: 4.9,
        reviews: 128,
        image: 'https://picsum.photos/400/400?random=1',
        category: 'Active',
        isFlash: true,
        timeLeft: '04:23:12',
        description: "Built for speed. The NeonX Runner Vapor features ultra-light composite materials and energy-return foam."
      },
      {
        id: '2',
        title: 'CyberSync Headset Pro',
        price: 299.00,
        rating: 4.8,
        reviews: 854,
        image: 'https://picsum.photos/400/400?random=2',
        category: 'Audio',
        isHot: true,
        description: "Zero latency audio for competitive edge. Noise cancellation so deep you will hear your own heartbeat."
      },
      {
        id: '3',
        title: 'Quantm Smart Watch',
        price: 350.00,
        rating: 4.7,
        reviews: 342,
        image: 'https://picsum.photos/400/400?random=3',
        category: 'Wearables',
        description: "Track every metric. The Quantm allows for biometric streaming and instant notifications."
      },
      {
        id: '4',
        title: 'Velocity Drone MK-II',
        price: 899.00,
        originalPrice: 1200.00,
        rating: 5.0,
        reviews: 42,
        image: 'https://picsum.photos/400/400?random=4',
        category: 'Tech',
        isFlash: true,
        timeLeft: '01:15:00',
        description: "Capture the impossible. 8K video at 120fps with obstacle avoidance and 45 minute flight time."
      },
      {
        id: '5',
        title: 'MechKey RGB 60%',
        price: 120.00,
        rating: 4.6,
        reviews: 1102,
        image: 'https://picsum.photos/400/400?random=5',
        category: 'Tech',
        description: "Tactile bliss. Hot-swappable switches and per-key RGB programming."
      }
    ];
  }

  private getMockCategories() {
    return [
      { id: 'tech', name: 'CyberDeck' },
      { id: 'audio', name: 'Audio' },
      { id: 'wear', name: 'Wearables' },
      { id: 'mobile', name: 'Mobile' },
      { id: 'sport', name: 'Active' },
    ];
  }

  private addToCartLocal(productId: string, quantity: number) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

export const apiService = new ApiService();