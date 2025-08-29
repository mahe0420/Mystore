import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  loading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onError, loading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        onError(paymentMethodError.message || 'Payment method creation failed');
        setProcessing(false);
        return;
      }

      // For demo purposes, simulate successful payment
      // In production, you would create a payment intent on your server
      setTimeout(() => {
        const mockPaymentIntentId = 'pi_mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        setSucceeded(true);
        setProcessing(false);
        onSuccess(mockPaymentIntentId);
      }, 2000);

    } catch (error: any) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Payment Successful!</h3>
        <p className="text-slate-600">Your order is being processed...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Card Details
        </label>
        <div className="border border-slate-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Amount to pay:</span>
          <span className="font-semibold text-slate-800">₹{amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center text-xs text-slate-500">
          <Lock className="h-3 w-3 mr-1" />
          <span>Secured by Stripe</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ₹{amount.toFixed(2)}
          </>
        )}
      </button>

      <div className="text-center text-xs text-slate-500">
        <p>Your payment information is secure and encrypted</p>
      </div>
    </form>
  );
};

interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

const StripePayment: React.FC<StripePaymentProps> = ({ amount, onSuccess, onError, loading = false }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="h-6 w-6 text-slate-600 mr-2" />
          <h3 className="text-lg font-semibold text-slate-800">Payment Details</h3>
        </div>
        
        <PaymentForm 
          amount={amount} 
          onSuccess={onSuccess} 
          onError={onError} 
          loading={loading}
        />
      </div>
    </Elements>
  );
};

export default StripePayment;