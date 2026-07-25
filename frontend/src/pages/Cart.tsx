import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem, clearCart, loading } = useCart();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg dark:text-white">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl mb-8"
        >
          🛒
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          Hãy chọn cho mình những tách trà và chiếc bánh thơm ngon nhé!
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-full inline-flex items-center gap-2 transition-transform hover:-translate-y-1 shadow-lg"
        >
          <ShoppingBag size={20} />
          Khám phá thực đơn
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 dark:text-gray-100 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingBag className="text-primary" size={32} />
        Giỏ hàng của bạn
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-4">
          {cart.items.map((item) => (
            <motion.div 
              key={item.id} 
              layout
              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img 
                  src={item.imageUrl || '/favicon.svg'} 
                  alt={item.productName || item.comboName || 'Item'} 
                  className="w-20 h-20 object-cover rounded-xl bg-gray-100 dark:bg-gray-700" 
                />
                <div>
                  <h3 className="font-bold text-lg">{item.productName || item.comboName}</h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {item.itemType}
                  </span>
                  <p className="text-primary font-bold mt-1">{item.unitPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  <button 
                    onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p className="font-extrabold text-lg w-28 text-right">
                  {item.totalPrice.toLocaleString('vi-VN')}₫
                </p>

                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <button 
              onClick={() => clearCart()}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} /> Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm sticky top-28 space-y-4">
            <h2 className="text-xl font-bold pb-2 border-b dark:border-gray-700">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Số lượng món:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{cart.itemCount}</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-gray-900 dark:text-white pt-4 border-t dark:border-gray-700">
                <span>Tổng tiền:</span>
                <span className="text-primary">{cart.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
            >
              Tiến hành thanh toán <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
