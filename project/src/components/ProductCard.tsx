import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Palette, Ruler } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="aspect-square overflow-hidden bg-slate-50 relative">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Custom Product Badge */}
          {product.isCustom && (
            <div className="absolute top-2 left-2">
              <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                New
              </span>
            </div>
          )}

          {/* Stock Status */}
          {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Low Stock
              </span>
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm">
              {product.title}
            </h3>
            {product.rating && (
              <div className="flex items-center ml-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-xs text-slate-600 ml-1">
                  {product.rating.rate}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-slate-600 text-xs mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Size and Color Indicators */}
          <div className="flex items-center space-x-4 mb-3">
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center space-x-1">
                <Ruler className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-600">
                  {product.sizes.length} size{product.sizes.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-1">
                <Palette className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-600">
                  {product.colors.length} color{product.colors.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Color Swatches Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex space-x-1 mb-3">
              {product.colors.slice(0, 4).map((colorName) => {
                const colorMap: { [key: string]: string } = {
                  'Black': '#000000',
                  'White': '#FFFFFF',
                  'Gray': '#6B7280',
                  'Navy': '#1E3A8A',
                  'Red': '#DC2626',
                  'Blue': '#2563EB',
                  'Green': '#059669',
                  'Purple': '#7C3AED',
                  'Pink': '#EC4899',
                  'Yellow': '#EAB308',
                  'Orange': '#EA580C',
                  'Brown': '#92400E'
                };
                
                return (
                  <div
                    key={colorName}
                    className="w-4 h-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: colorMap[colorName] || '#6B7280' }}
                    title={colorName}
                  />
                );
              })}
              {product.colors.length > 4 && (
                <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <span className="text-xs text-slate-600">+{product.colors.length - 4}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-slate-800">
                ${product.price.toFixed(2)}
              </span>
              {product.stock !== undefined && (
                <p className="text-xs text-slate-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`p-2 rounded-lg transition-colors ${
                product.stock === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;