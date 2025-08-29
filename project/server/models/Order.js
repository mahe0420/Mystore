import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string for external products
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  size: String,
  color: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, match: /^[1-9][0-9]{5}$/ },
    country: { type: String, required: true, default: 'India' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'card', 'upi', 'netbanking', 'wallet', 'cod']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: String,
  breakdown: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true }
  },
  orderNumber: {
    type: String,
    unique: true
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  notes: String,
  codAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'LUX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  // Set COD amount if payment method is COD
  if (this.paymentMethod === 'cod') {
    this.codAmount = this.totalAmount;
  }
  
  // Set estimated delivery based on status
  if (this.status === 'shipped' && !this.estimatedDelivery) {
    this.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from shipping
  }
  
  next();
});

// Remove duplicate indexes - only keep one of each
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentIntentId: 1 });
orderSchema.index({ paymentMethod: 1 });

export const Order = mongoose.model('Order', orderSchema);