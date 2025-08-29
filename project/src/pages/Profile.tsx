import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit2, Save, X, Package, Truck, CheckCircle, Clock, XCircle, DollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { formatIndianCurrency } from '../utils/indiaData';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userOrders = await orderService.getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleSave = () => {
    // In a real app, this would update the user data
    console.log('Saving user data:', editedName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cod':
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'stripe':
      case 'card':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-slate-600" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'stripe':
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI Payment';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Digital Wallet';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8">
                <div className="text-center">
                  <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-800" />
                  </div>
                  <h1 className="text-xl font-bold text-white">{user.name}</h1>
                  <p className="text-slate-300 capitalize">{user.role} Account</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-slate-400" />
                      <div>
                        <label className="text-sm font-medium text-slate-600">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="block w-full mt-1 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        ) : (
                          <p className="text-slate-800">{user.name}</p>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-slate-600 hover:text-slate-800 p-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email Address</label>
                      <p className="text-slate-800">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <label className="text-sm font-medium text-slate-600">Member Since</label>
                      <p className="text-slate-800">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4 mt-6 border-t">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}

                {/* Account Stats */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-800">{orders.length}</div>
                      <div className="text-sm text-slate-600">Orders</div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-800">
                        {formatIndianCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                      </div>
                      <div className="text-sm text-slate-600">Total Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-slate-800">Order History</h2>
                <p className="text-slate-600">Track your orders and view order details</p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No orders yet</h3>
                    <p className="text-slate-600 mb-6">Start shopping to see your orders here</p>
                    <a
                      href="/products"
                      className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-slate-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Total Amount</p>
                            <p className="font-semibold text-slate-800">{formatIndianCurrency(order.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Items</p>
                            <p className="font-semibold text-slate-800">{order.items?.length || 0} items</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Payment Method</p>
                            <div className="flex items-center space-x-1">
                              {getPaymentMethodIcon(order.paymentMethod)}
                              <p className="font-semibold text-slate-800">
                                {getPaymentMethodName(order.paymentMethod)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Status for COD */}
                        {order.paymentMethod === 'cod' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800">
                                Cash on Delivery - {formatIndianCurrency(order.totalAmount)}
                              </span>
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">
                              {order.paymentStatus === 'paid' 
                                ? 'Payment completed upon delivery' 
                                : 'Pay when your order is delivered'}
                            </p>
                          </div>
                        )}

                        {/* Order Progress */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className={`flex items-center space-x-2 ${
                              ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) 
                                ? 'text-green-600' : 'text-slate-400'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                ['pending', 'processing', 'shipped', 'delivered'].includes(order.status)
                                  ? 'bg-green-500' : 'bg-slate-300'
                              }`}></div>
                              <span>Order Placed</span>
                            </div>
                            
                            <div className={`flex items-center space-x-2 ${
                              ['processing', 'shipped', 'delivered'].includes(order.status) 
                                ? 'text-green-600' : 'text-slate-400'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                ['processing', 'shipped', 'delivered'].includes(order.status)
                                  ? 'bg-green-500' : 'bg-slate-300'
                              }`}></div>
                              <span>Processing</span>
                            </div>
                            
                            <div className={`flex items-center space-x-2 ${
                              ['shipped', 'delivered'].includes(order.status) 
                                ? 'text-green-600' : 'text-slate-400'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                ['shipped', 'delivered'].includes(order.status)
                                  ? 'bg-green-500' : 'bg-slate-300'
                              }`}></div>
                              <span>Shipped</span>
                            </div>
                            
                            <div className={`flex items-center space-x-2 ${
                              order.status === 'delivered' 
                                ? 'text-green-600' : 'text-slate-400'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                order.status === 'delivered'
                                  ? 'bg-green-500' : 'bg-slate-300'
                              }`}></div>
                              <span>Delivered</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: order.status === 'pending' ? '25%' :
                                       order.status === 'processing' ? '50%' :
                                       order.status === 'shipped' ? '75%' :
                                       order.status === 'delivered' ? '100%' : '0%'
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-slate-600 mb-1">Shipping Address</p>
                            <p className="text-sm text-slate-800">
                              {order.shippingAddress.name} - {order.shippingAddress.phone}
                            </p>
                            <p className="text-sm text-slate-800">
                              {order.shippingAddress.street}, {order.shippingAddress.area}
                            </p>
                            <p className="text-sm text-slate-800">
                              {order.shippingAddress.city}, {order.shippingAddress.district}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;