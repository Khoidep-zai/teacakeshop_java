import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Tag, Loader2 } from 'lucide-react';
import type { Combo } from '../types';
import { getCombo } from '../api/combos';
import { useCart } from '../hooks/useCart';

export default function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getCombo(Number(id));
        setCombo(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!combo) return;
    setAdding(true);
    try {
      await addItem('COMBO', combo.id, quantity);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Không tìm thấy Combo</h2>
        <button onClick={() => navigate('/combos')} className="mt-4 text-primary hover:underline font-semibold">
          Quay lại danh sách Combo
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 dark:text-gray-100 max-w-6xl">
      <button 
        onClick={() => navigate('/combos')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-6 font-semibold"
      >
        <ArrowLeft size={18} />
        Quay lại danh sách Combo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square">
          <img src={combo.imageUrl || '/favicon.svg'} alt={combo.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            {combo.weatherType}
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{combo.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{combo.description}</p>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold text-primary">{combo.comboPrice.toLocaleString('vi-VN')}₫</span>
                {combo.originalPrice > combo.comboPrice && (
                  <span className="text-lg text-gray-400 line-through">{combo.originalPrice.toLocaleString('vi-VN')}₫</span>
                )}
              </div>
              {combo.savingAmount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <Tag size={12} /> Tiết kiệm {combo.savingAmount.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* Included Items */}
            {combo.items && combo.items.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Các món có trong Combo:</h3>
                <div className="space-y-3">
                  {combo.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={item.product?.imageUrl || '/favicon.svg'} alt={item.product?.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="font-bold text-sm">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">{item.product?.taste}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-sm text-primary">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t dark:border-gray-700 flex gap-4">
            <div className="flex items-center border dark:border-gray-600 rounded-xl px-3 py-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 font-bold text-lg">-</button>
              <span className="px-4 font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-2 font-bold text-lg">+</button>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
            >
              {adding ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
              Thêm Combo vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
