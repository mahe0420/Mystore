import express from 'express';
import Stripe from 'stripe';
import { auth } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}` 
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });
    }
    
    // Add tax and shipping
    const tax = totalAmount * 0.18; // 18% GST for India
    const shipping = totalAmount > 2000 ? 0 : 100; // Free shipping above ₹2000
    const finalAmount = Math.round((totalAmount + tax + shipping) * 100); // Convert to paise
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'inr',
      metadata: {
        userId: req.user.userId,
        itemCount: items.length.toString(),
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: finalAmount,
      breakdown: {
        subtotal: totalAmount,
        tax: tax,
        shipping: shipping,
        total: totalAmount + tax + shipping
      }
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Confirm payment and create order
router.post('/confirm-payment-intent', auth, async (req, res) => {
  try {
    const { paymentIntentId, items, shippingAddress } = req.body;
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Add tax and shipping
    const tax = totalAmount * 0.18;
    const shipping = totalAmount > 2000 ? 0 : 100;
    const finalAmount = totalAmount + tax + shipping;
    
    // Create order
    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount: finalAmount,
      shippingAddress,
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntentId,
      breakdown: {
        subtotal: totalAmount,
        tax: tax,
        shipping: shipping
      }
    });
    
    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'title image price');
    
    res.json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// Get payment methods
router.get('/payment-methods', (req, res) => {
  res.json({
    methods: [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, RuPay',
        icon: 'credit-card'
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'PhonePe, Google Pay, Paytm',
        icon: 'smartphone'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'All major banks',
        icon: 'building'
      },
      {
        id: 'wallet',
        name: 'Wallets',
        description: 'Paytm, PhonePe, Amazon Pay',
        icon: 'wallet'
      }
    ]
  });
});
// ✅ COD Order Processing (No Stripe)
router.post('/cod-order', auth, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items to order' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });

      // Decrease stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Tax + shipping
    const tax = totalAmount * 0.18;
    const shipping = totalAmount > 2000 ? 0 : 100;
    const finalAmount = totalAmount + tax + shipping;

    // Create order
    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount: finalAmount,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      breakdown: {
        subtotal: totalAmount,
        tax,
        shipping
      }
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'title image price');

    res.json({
      message: 'Cash on Delivery order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('COD order error:', error);
    res.status(500).json({ message: 'Failed to place COD order' });
  }
});


export default router;