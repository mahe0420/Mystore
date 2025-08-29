import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Sparkles, Award, Truck } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { productService } from '../services/productService';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch custom products from MongoDB
        const mongoProducts = await productService.getAllProducts();
        const activeCustomProducts = mongoProducts.filter((p: Product) => p.status === 'active');
        
        // Fetch from external API for featured section
        let apiProducts = [];
        try {
          const response = await fetch('https://fakestoreapi.com/products/category/women\'s clothing?limit=4');
          apiProducts = await response.json();
        } catch (error) {
          console.log('External API unavailable, using MongoDB products for featured section');
          apiProducts = activeCustomProducts.slice(0, 4);
        }
        
        setFeaturedProducts(apiProducts);
        setCustomProducts(activeCustomProducts.slice(0, 4)); // Show latest 4 custom products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Premium Collection</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Luxury Fashion
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-white block">
                Redefined
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Discover our curated collection of premium clothing store. 
              Each piece is carefully selected for exceptional quality and craftsmanship.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg"
              >
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-slate-800 transition-all duration-300 flex items-center justify-center"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose MyStore</h2>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Premium Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                Every piece is carefully selected for exceptional quality and craftsmanship. 
                We partner with renowned designers and manufacturers.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Secure Storage</h3>
              <p className="text-slate-600 leading-relaxed">
                All products and user data are stored securely in MongoDB with unlimited scalability. 
                Your data persists across all devices and browsers.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Fast Delivery</h3>
              <p className="text-slate-600 leading-relaxed">
                Quick and secure shipping worldwide. Free shipping on orders over $100. 
                Track your order every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals (Custom Products from MongoDB) */}
      {customProducts.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
               
                
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">New In Store</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Discover our latest additions products handpicked pieces that define contemporary style
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {customProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Featured Collection</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the season's must-have pieces
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div className="text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center bg-slate-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  View All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Stay in Style</h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
              Subscribe to our newsletter and be the first to know about new arrivals., 
              exclusive offers, and style tips from our fashion experts.
            </p>
            
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 text-center sm:text-left"
              />
              <button className="bg-white text-slate-800 px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mt-4">
              Join over 10,000+ fashion enthusiasts. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;