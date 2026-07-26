import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem, clearCart, loading } = useCart();

  const getItemImage = (item: any) => {
    if (item.imageUrl && item.imageUrl !== '/favicon.svg') return item.imageUrl;
    if (item.itemType === 'COMBO') return '/images/combos/royal_tea_set.png';
    const name = (item.productName || '').toLowerCase();
    if (name.includes('matcha')) return '/images/products/matcha_cake.png';
    if (name.includes('earl')) return '/images/products/earl_grey.png';
    if (name.includes('sakura')) return '/images/products/sakura_tea.png';
    return '/images/products/matcha_cake.png';
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center max-w-lg mx-auto">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-4 text-center max-w-md mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-4xl mb-6 shadow-inner"
        >
          🍵
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-3 text-slate-900 dark:text-white font-serif-title">Giỏ Hàng Đang Trống</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Hãy cùng chọn những tách trà hữu cơ thơm lừng và các phần bánh ngọt nghệ thuật Pháp nhé!
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="btn-primary text-xs px-8 py-3.5 flex items-center justify-center gap-2 mx-auto"
        >
          <ShoppingBag size={16} />
          <span>Khám Phá Thực Đơn Thưởng Trà</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyber-teal" /> 
            <span>Giỏ Hàng Trải Nghiệm 2026</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Món Ăn Đã Chọn ({cart.itemCount})
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Items List */}
        <div className="lg:w-2/3 space-y-4">
          {cart.items.map((item) => (
            <motion.div 
              key={item.id} 
              layout
              className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img 
                  src={getItemImage(item)} 
                  alt={item.productName || item.comboName || 'Item'} 
                  className="w-20 h-20 object-cover rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-sm" 
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif-title">
                    {item.productName || item.comboName}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary-glow/20 dark:text-primary-glow mt-1">
                    {item.itemType}
                  </span>
                  <p className="text-primary dark:text-primary-glow font-extrabold text-sm mt-1">
                    {item.unitPrice.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                    className="p-1.5 hover:text-primary transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-extrabold text-xs w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                  <button 
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="p-1.5 hover:text-primary transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="font-black text-base w-28 text-right text-slate-900 dark:text-white">
                  {item.totalPrice.toLocaleString('vi-VN')}₫
                </p>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  title="Xóa khỏi giỏ"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={() => clearCart()}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} /> Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="glass-card-static p-6 sticky top-28 space-y-6">
            <h2 className="text-xl font-extrabold font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800">
              Tóm Tắt Đơn Hàng
            </h2>
            
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Số lượng món:</span>
                <span className="font-bold text-slate-900 dark:text-white">{cart.itemCount} món</span>
              </div>
              <div className="flex justify-between">
                <span>Ưu đãi AI Coupon:</span>
                <span className="font-bold text-emerald-500">Tự động áp dụng</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-800">
                <span>Tổng cộng:</span>
                <span className="text-primary dark:text-primary-glow">{cart.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Tiến Hành Thanh Toán</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Giao hàng tận nơi siêu tốc trong 30 phút</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
