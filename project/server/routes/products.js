import express from 'express';
import { Product } from '../models/Product.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, status, search, sort, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by status (default to active for non-admin users)
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };
    else if (sort === 'name') sortOption = { title: 1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'name email');
    
    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      images: product.images,
      rating: product.rating,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      status: product.status,
      isCustom: product.isCustom,
      createdAt: product.createdAt,
      _id: product._id
    }));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products: transformedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const transformedProduct = {
      id: product._id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      images: product.images,
      rating: product.rating,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      status: product.status,
      isCustom: product.isCustom,
      createdAt: product.createdAt,
      _id: product._id
    };
    
    res.json({ product: transformedProduct });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Create product (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.userId
    };
    
    const product = await Product.create(productData);
    
    const transformedProduct = {
      id: product._id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      images: product.images,
      rating: product.rating,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      status: product.status,
      isCustom: product.isCustom,
      createdAt: product.createdAt,
      _id: product._id
    };
    
    res.status(201).json({
      message: 'Product created successfully',
      product: transformedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const transformedProduct = {
      id: product._id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      images: product.images,
      rating: product.rating,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      status: product.status,
      isCustom: product.isCustom,
      createdAt: product.createdAt,
      _id: product._id
    };
    
    res.json({
      message: 'Product updated successfully',
      product: transformedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

export default router;