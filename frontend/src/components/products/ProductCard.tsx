import React, { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem('PRODUCT', product.id, 1);
      toast.success(`Đã thêm ${product.name} vào giỏ!`, {
        style: {
          borderRadius: '16px',
          background: '#333',
          color: '#fff',
        },
        iconTheme: {
          primary: '#4CAF82',
          secondary: '#FFFAEE',
        },
      });
    } catch {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full transform hover:-translate-y-1">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
        <img 
          src={product.imageUrl || '/favicon.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200">
          {product.productType}
        </div>
        {product.taste && (
          <div className="absolute bottom-3 left-3 bg-accent/90 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
            {product.taste}
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className="font-extrabold text-xl text-primary">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          <button 
            onClick={handleAdd}
            disabled={adding || product.stockQuantity <= 0}
            className="bg-gray-100 hover:bg-primary dark:bg-gray-700 dark:hover:bg-primary text-gray-900 hover:text-white dark:text-white p-3 rounded-2xl transition-colors active:scale-90 disabled:opacity-50"
          >
            {adding ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
