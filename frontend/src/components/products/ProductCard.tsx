import React, { useState } from 'react';
import { ShoppingCart, Loader2, Sparkles, Star } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../../types';
import { getProductImageUrl } from '../../utils/imageHelpers';

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
      toast.success(`Đã thêm "${product.name}" vào giỏ! ✨`, {
        style: {
          borderRadius: '20px',
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(6, 182, 212, 0.3)',
        },
        iconTheme: {
          primary: '#52B788',
          secondary: '#FFFFFF',
        },
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group glass-card p-4 flex flex-col h-full relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-xl group-hover:bg-cyber-teal/20 transition-colors duration-500 pointer-events-none" />

      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 shadow-sm">
        <img 
          src={getProductImageUrl(product)} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        
        {/* Product Type Badge */}
        <div className="absolute top-3 left-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-slate-800 dark:text-slate-200 border border-white/50 dark:border-slate-700/50 flex items-center gap-1 shadow-sm">
          <span>{product.productType === 'TEA' ? '🍵 Trà Thuần' : '🍰 Bánh Thủ Công'}</span>
        </div>

        {/* AI Recommendation Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-cyber-teal/90 to-cyber-violet/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>AI Match</span>
        </div>

        {/* Taste Tag */}
        {product.taste && (
          <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-sm">
            {product.taste}
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>4.9</span>
            <span className="text-slate-400 font-normal text-[11px]">(128)</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-light transition-colors font-serif-title">
            {product.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Thành phần hữu cơ thượng hạng, sáng tạo độc quyền bởi Tea & Cake Lounge.'}
          </p>
        </div>
        
        {/* Price & Action Button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {product.discountAmount ? product.discountCampaignName || 'Đang khuyến mãi' : 'Giá niêm yết'}
            </span>
            <span className="font-extrabold text-lg text-primary dark:text-primary-glow">
              {(product.finalPrice ?? product.price).toLocaleString('vi-VN')}₫
            </span>
            {(product.finalPrice ?? product.price) < product.price && (
              <span className="text-[10px] text-slate-400 line-through">{product.price.toLocaleString('vi-VN')}₫</span>
            )}
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={adding || product.stockQuantity <= 0}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary text-slate-800 hover:text-white dark:text-slate-200 flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm disabled:opacity-50"
            title="Thêm vào giỏ hàng"
          >
            {adding ? <Loader2 size={18} className="animate-spin text-primary" /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
