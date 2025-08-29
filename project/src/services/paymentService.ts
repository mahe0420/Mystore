import api from './api';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  breakdown: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}
class PaymentService {
  async createPaymentIntent(items: any[], shippingAddress: any): Promise<PaymentIntent> {
    try {
      const response = await api.post('/payments/create-payment-intent', {
        items,
        shippingAddress
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string, items: any[], shippingAddress: any): Promise<any> {
    try {
      const response = await api.post('/payments/confirm-payment', {
        paymentIntentId,
        items,
        shippingAddress
      });
      return response.data.order;
    } catch (error: any) {
      console.error("❌ Confirm Payment Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/payments/payment-methods');
      return response.data.methods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}


export const paymentService = new PaymentService();
