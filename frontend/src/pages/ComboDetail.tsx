import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Combo } from '../types';
import { getCombo } from '../api/combos';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const fallbackCombo: Combo = {
    id: Number(id) || 1,
    name: 'Set Trà Chiều Royal Afternoon Tea Pass',
    description: 'Trải nghiệm thưởng trà đỉnh cao với bộ đôi Bánh Matcha Mousse layered lá vàng và Trà Oolong Kim Tuyên ủ lạnh 12 tiếng. Tiết kiệm ngay 30.000₫.',
    originalPrice: 165000,
    comboPrice: 135000,
    savingAmount: 30000,
    imageUrl: '/images/combos/royal_tea_set.png',
    active: true,
    weatherType: 'SUNNY',
    hotScore: 99,
    bestSellerScore: 95,
    createdAt: new Date().toISOString(),
    items: [
      { id: 101, quantity: 1, product: { id: 1, name: 'Bánh Matcha Mousse Layered 2026', price: 75000, taste: 'Ngọt nhẹ thanh mát', imageUrl: '/images/products/matcha_cake.png' } as any },
      { id: 102, quantity: 1, product: { id: 3, name: 'Trà Oolong Kim Tuyên Ủ Lạnh', price: 65000, taste: 'Hương mộc thanh tao', imageUrl: '/images/products/sakura_tea.png' } as any }
    ]
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getCombo(Number(id));
        if (data && data.id) {
          setCombo(data);
        } else {
          setCombo(fallbackCombo);
        }
      } catch (error) {
        setCombo(fallbackCombo);
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
      toast.success(`Đã thêm ${quantity}x Combo "${combo.name}" vào giỏ hàng! ✨`, {
        style: {
          borderRadius: '20px',
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(231, 111, 81, 0.4)',
        },
      });
    } catch (e) {
      toast.error('Không thể thêm combo vào giỏ');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] pt-32">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="pt-32 pb-20 px-4 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif-title mb-4">Không tìm thấy Combo này</h2>
        <button onClick={() => navigate('/combos')} className="btn-primary text-xs px-6 py-2.5">
          Quay lại danh sách Combo
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      
      <button 
        onClick={() => navigate('/combos')}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-accent transition-colors mb-6 text-xs font-bold"
      >
        <ArrowLeft size={16} />
        <span>Quay lại danh sách Combo</span>
      </button>

      <div className="glass-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square shadow-xl border border-white/50 dark:border-slate-800">
            <img 
              src={combo.imageUrl || '/images/combos/royal_tea_set.png'} 
              alt={combo.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
            {combo.weatherType && (
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-full text-xs font-black shadow-md border border-white/20">
                🌤️ Combo Weather Pass
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-accent to-accent-light text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiết kiệm {combo.savingAmount?.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent block mb-1">Set Phối Vị Hoàng Gia</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif-title leading-tight mb-3">
                {combo.name}
              </h1>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {combo.description}
              </p>

              <div className="bg-slate-100/80 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-accent">
                    {combo.comboPrice.toLocaleString('vi-VN')}₫
                  </span>
                  {combo.originalPrice > combo.comboPrice && (
                    <span className="text-base text-slate-400 line-through">
                      {combo.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
                {combo.savingAmount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} /> Tiết kiệm ngay {combo.savingAmount.toLocaleString('vi-VN')}₫ so với mua lẻ
                  </span>
                )}
              </div>

              {/* Items included */}
              {combo.items && combo.items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-serif-title">Các món gồm trong Combo:</h3>
                  <div className="space-y-2.5">
                    {combo.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.product?.imageUrl || '/images/products/matcha_cake.png'} 
                            alt={item.product?.name} 
                            className="w-11 h-11 object-cover rounded-xl shadow-sm" 
                          />
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">{item.product?.name || 'Món đặc sắc trong set'}</p>
                            <p className="text-[11px] text-slate-400">{item.product?.taste || 'Khẩu vị chuẩn'}</p>
                          </div>
                        </div>
                        <span className="font-black text-xs text-accent bg-accent/10 px-2.5 py-1 rounded-xl">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex gap-4">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-2 py-1 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 font-bold text-sm">-</button>
                <span className="px-3 font-extrabold text-sm text-slate-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 font-bold text-sm">+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 btn-accent py-4 text-sm font-extrabold shadow-lg"
              >
                {adding ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                <span>Thêm Combo Vào Giỏ ({(combo.comboPrice * quantity).toLocaleString('vi-VN')}₫)</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
