import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, MapPin, User, Truck, Package, CheckCircle, Phone, Home, Smartphone, Wallet, Building, DollarSign } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { indianStates, getDistrictsByState, validatePincode, formatIndianCurrency } from '../utils/indiaData';
import StripePayment from '../components/StripePayment';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const paymentOptions = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'PhonePe, Google Pay, Paytm',
      icon: Smartphone,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks',
      icon: Building,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Paytm, PhonePe, Amazon Pay',
      icon: Wallet,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: DollarSign,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!shippingAddress.name.trim()) newErrors.name = 'Name is required';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone)) newErrors.phone = 'Invalid Indian phone number';
    
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!shippingAddress.area.trim()) newErrors.area = 'Area/Locality is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.district) newErrors.district = 'District is required';
    if (!shippingAddress.state) newErrors.state = 'State is required';
    if (!shippingAddress.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!validatePincode(shippingAddress.pincode)) newErrors.pincode = 'Invalid pincode format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) return;
    
    if (!validateForm()) return;

    setShowPayment(true);
  };

  const handleCashOnDeliveryOrder = async () => {
    setLoading(true);
    setPaymentError('');
    
    try {
      console.log('Creating COD order with data:', {
        items: items.map(item => ({
          product: item.product.id.toString(),
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress,
        paymentMethod: 'cod'
      });

      // Create order with COD payment method
      const orderData = {
        items: items.map(item => ({
          product: item.product.id.toString(),
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          area: shippingAddress.area,
          city: shippingAddress.city,
          district: shippingAddress.district,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country
        },
        paymentMethod: 'cod'
      };

      const order = await orderService.createOrder(orderData);
      
      console.log('COD Order created successfully:', order);
      
      // Clear cart and show success
      clearCart();
      setOrderId(order._id);
      setOrderPlaced(true);
      setShowCheckout(false);
      setShowPayment(false);
    } catch (error: any) {
      console.error('COD Order creation error:', error);
      setPaymentError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setLoading(true);
    try {
      // Create order after successful payment
      const orderData = {
        items: items.map(item => ({
          product: item.product.id.toString(),
          quantity: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          area: shippingAddress.area,
          city: shippingAddress.city,
          district: shippingAddress.district,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country
        },
        paymentMethod: paymentMethod,
        paymentIntentId: paymentIntentId
      };

      const order = await orderService.createOrder(orderData);
      
      // Clear cart and show success
      clearCart();
      setOrderId(order._id);
      setOrderPlaced(true);
      setShowCheckout(false);
      setShowPayment(false);
    } catch (error: any) {
      console.error('Order creation error:', error);
      setPaymentError('Order creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setLoading(false);
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 2000 ? 0 : 100; // Free shipping above ₹2000
  const total = subtotal + tax + shipping;

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Placed Successfully!</h2>
            <p className="text-slate-600">Thank you for shopping with Luxe</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600 mb-1">Order ID</p>
            <p className="font-mono text-slate-800">{orderId.slice(-8).toUpperCase()}</p>
          </div>

          <div className="space-y-3 text-sm text-slate-600 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Order is being processed</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Estimated delivery: 3-5 business days</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
            >
              Track Your Order
            </button>
            <button
              onClick={() => {
                setOrderPlaced(false);
                navigate('/products');
              }}
              className="w-full border border-slate-300 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Add some products to get started</p>
          <Link
            to="/products"
            className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${item.color}-${index}`} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{item.product.title}</h3>
                    <p className="text-slate-600 text-sm">{item.product.category}</p>
                    {item.size && (
                      <p className="text-slate-600 text-sm">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-slate-600 text-sm">Color: {item.color}</p>
                    )}
                    <p className="text-lg font-bold text-slate-800 mt-2">
                      {formatIndianCurrency(item.product.price)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)}
                      className="p-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)}
                      className="p-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* User Info */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Shopping as {user.name}
                    </h3>
                    
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatIndianCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatIndianCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%)</span>
                  <span>{formatIndianCurrency(tax)}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-slate-800">
                  <span>Total</span>
                  <span>{formatIndianCurrency(total)}</span>
                </div>
              </div>

              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{paymentError}</p>
                </div>
              )}

              {!showCheckout && !showPayment ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </button>
                  <Link
                    to="/products"
                    className="w-full border border-slate-200 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : showPayment ? (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Choose Payment Method</h3>
                    <div className="space-y-3">
                      {paymentOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setPaymentMethod(option.id)}
                            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                              paymentMethod === option.id
                                ? `${option.color} border-current`
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-6 w-6" />
                              <div>
                                <div className="font-semibold">{option.name}</div>
                                <div className="text-sm opacity-75">{option.description}</div>
                              </div>
                              <div className="ml-auto">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  paymentMethod === option.id
                                    ? 'bg-current border-current'
                                    : 'border-slate-300'
                                }`}>
                                  {paymentMethod === option.id && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Processing */}
                  {paymentMethod === 'stripe' && (
                    <StripePayment
                      amount={total}
                      onSuccess={handleStripePaymentSuccess}
                      onError={handlePaymentError}
                      loading={loading}
                    />
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <DollarSign className="h-6 w-6 text-yellow-600 mr-2" />
                        <h3 className="text-lg font-semibold text-yellow-800">Cash on Delivery</h3>
                      </div>
                      <div className="space-y-3 text-sm text-yellow-700 mb-6">
                        <p>• Pay {formatIndianCurrency(total)} when your order is delivered</p>
                        <p>• No advance payment required</p>
                        <p>• Cash payment to delivery executive</p>
                        <p>• Order will be confirmed immediately</p>
                      </div>
                      <button
                        onClick={handleCashOnDeliveryOrder}
                        disabled={loading}
                        className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-5 w-5 mr-2" />
                            Place Order - COD
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {(paymentMethod === 'upi' || paymentMethod === 'netbanking' || paymentMethod === 'wallet') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <div className="mb-4">
                        <div className="text-blue-600 mb-2">
                          {paymentMethod === 'upi' && <Smartphone className="h-8 w-8 mx-auto" />}
                          {paymentMethod === 'netbanking' && <Building className="h-8 w-8 mx-auto" />}
                          {paymentMethod === 'wallet' && <Wallet className="h-8 w-8 mx-auto" />}
                        </div>
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                          {paymentMethod === 'upi' && 'UPI Payment'}
                          {paymentMethod === 'netbanking' && 'Net Banking'}
                          {paymentMethod === 'wallet' && 'Digital Wallet'}
                        </h3>
                        <p className="text-blue-700 text-sm">
                          You will be redirected to complete your payment securely
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // For demo purposes, simulate payment success
                          setLoading(true);
                          setTimeout(() => {
                            handleStripePaymentSuccess('demo_payment_' + Date.now());
                          }, 2000);
                        }}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay {formatIndianCurrency(total)}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowPayment(false)}
                    className="w-full border border-slate-300 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Back to Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    Delivery Address
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.phone ? 'border-red-300' : 'border-slate-300'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="House No, Building Name *"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.street ? 'border-red-300' : 'border-slate-300'}`}
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Area, Street, Sector, Village *"
                        value={shippingAddress.area}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, area: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.area ? 'border-red-300' : 'border-slate-300'}`}
                      />
                      {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <select
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value, district: '', city: '' }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.state ? 'border-red-300' : 'border-slate-300'}`}
                        >
                          <option value="">Select State *</option>
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <select
                          value={shippingAddress.district}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, district: e.target.value, city: e.target.value }))}
                          disabled={!shippingAddress.state}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.district ? 'border-red-300' : 'border-slate-300'} ${!shippingAddress.state ? 'bg-gray-100' : ''}`}
                        >
                          <option value="">Select District *</option>
                          {getDistrictsByState(shippingAddress.state).map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                        {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Pincode *"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.pincode ? 'border-red-300' : 'border-slate-300'}`}
                        maxLength={6}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <button
                      onClick={handleProceedToPayment}
                      disabled={loading}
                      className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CreditCard className="h-5 w-5 mr-2" />
                      )}
                      {loading ? 'Processing...' : `Proceed to Payment`}
                    </button>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="w-full border border-slate-300 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              )}
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;