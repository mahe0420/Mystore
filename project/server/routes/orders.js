import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentIntentId } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({ message: 'Invalid item data' });
      }
      
      // Try to find product in database
      let product;
      try {
        product = await Product.findById(item.product);
      } catch (error) {
        // If not found by MongoDB ID, skip product validation for external products
        console.log(`Product ${item.product} not found in MongoDB, treating as external product`);
      }
      
      // For COD orders, we don't need to check stock immediately
      // For other payment methods, check stock if product exists in our database
      if (paymentMethod !== 'cod' && product && product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product?.title || 'product'}. Available: ${product.stock}` 
        });
      }
      
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      });
      
      // Update product stock only for non-COD orders and if product exists in our database
      if (paymentMethod !== 'cod' && product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }
    
    // Add tax and shipping
    const tax = totalAmount * 0.18; // 18% GST
    const shipping = totalAmount > 2000 ? 0 : 100; // Free shipping above ₹2000
    const finalAmount = totalAmount + tax + shipping;
    
    // Determine payment status based on payment method
    let paymentStatus = 'pending';
    if (paymentMethod === 'cod') {
      paymentStatus = 'pending'; // COD orders are pending until delivery
    } else if (paymentIntentId) {
      paymentStatus = 'paid'; // Online payments are immediately paid
    }
    
    // Create order
    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount: finalAmount,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        area: shippingAddress.area,
        city: shippingAddress.city,
        district: shippingAddress.district,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India'
      },
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentIntentId: paymentIntentId,
      breakdown: {
        subtotal: totalAmount,
        tax: tax,
        shipping: shipping
      },
      codAmount: paymentMethod === 'cod' ? finalAmount : 0
    });
    
    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'title image price',
        // Handle cases where product might not exist in our database
        options: { strictPopulate: false }
      });
    
    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      message: 'Server error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate({
        path: 'items.product',
        select: 'title image price',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 });
    
    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get all orders (Admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'title image price',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')
     .populate({
       path: 'items.product',
       select: 'title image price',
       options: { strictPopulate: false }
     });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If order is delivered and was COD, mark payment as paid
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      await order.save();
    }
    
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

export default router;