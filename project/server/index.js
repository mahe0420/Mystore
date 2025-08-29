import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
    },
  },
}));
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Luxe Store API is running with MongoDB Atlas',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected to Atlas' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB Atlas Connection with fixed deprecated options
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌍 Atlas Cluster: Connected successfully`);
    
    // Create default admin user if it doesn't exist
    await createDefaultUsers();
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    console.error('💡 Make sure your MongoDB Atlas connection string is correct in .env file');
    console.error('💡 Check if your IP is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

// Create default users in MongoDB Atlas
const createDefaultUsers = async () => {
  try {
    const { User } = await import('./models/User.js');
    const bcrypt = await import('bcryptjs');
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@luxe.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Admin User',
        email: 'admin@luxe.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created in MongoDB Atlas');
    } else {
      console.log('✅ Admin user already exists in MongoDB Atlas');
    }

    // Check if demo user exists
    const userExists = await User.findOne({ email: 'user@luxe.com' });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('user123', 12);
      await User.create({
        name: 'Demo User',
        email: 'user@luxe.com',
        password: hashedPassword,
        role: 'user',
        isActive: true
      });
    }
  } catch (error) {
    console.error('Error creating default users in Atlas:', error);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    console.log(`🎯 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`💳 Stripe Integration: ${process.env.STRIPE_SECRET_KEY ? 'Enabled' : 'Disabled'}`);
    console.log(`🗄️ Database: MongoDB Atlas Cloud`);
  });
};

startServer();