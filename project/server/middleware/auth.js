import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        requiresLogin: true 
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired. Please login again.',
          requiresLogin: true,
          expired: true
        });
      }
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.',
        requiresLogin: true 
      });
    }
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'User account not found or deactivated. Please login again.',
        requiresLogin: true 
      });
    }
    
    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: 'Authentication failed. Please login again.',
      requiresLogin: true 
    });
  }
};

export const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      requiresAdmin: true 
    });
  }
  next();
};

// Middleware to refresh token if it's about to expire
export const refreshTokenIfNeeded = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return next();

    // Check if token expires in less than 1 hour
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    
    if (timeUntilExpiry < 3600) { // Less than 1 hour
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        const newToken = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.setHeader('X-New-Token', newToken);
      }
    }
    
    next();
  } catch (error) {
    next(); // Continue even if refresh fails
  }
};
