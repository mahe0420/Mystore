import api from './api';

export interface CreateOrderData {
  items: {
    product: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    area: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentIntentId?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: {
    product: any;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  totalAmount: number;
  status: string;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  paymentIntentId?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders/my-orders');
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders');
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }
}

export const orderService = new OrderService();