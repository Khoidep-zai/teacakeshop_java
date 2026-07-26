import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Loader2, Sparkles, CheckCircle2, Minus, Plus } from 'lucide-react';
import { getCombo, getComboSuggestions } from '../api/combos';
import { useCart } from '../hooks/useCart';
import type { Combo, ProductSuggestion } from '../types';
import { getComboImageUrl } from '../utils/imageHelpers';
import toast from 'react-hot-toast';
import ProductCard from '../components/products/ProductCard';

const ComboDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);

  useEffect(() => {
    const fetchCombo = async () => {
      if (!id) return;
      const numId = Number(id);
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const data = await getCombo(numId);
        setCombo(data);
        try {
          const suggestionData = await getComboSuggestions(numId);
          setSuggestions(Array.isArray(suggestionData) ? suggestionData : []);
        } catch {
          setSuggestions([]);
        }
      } catch (error: any) {
        setCombo(null);
        setSuggestions([]);
        toast.error(error?.response?.data?.message || 'Không tìm thấy combo đang bán.');
      } finally {
        setLoading(false);
      }
    };

    fetchCombo();
  }, [id]);

  const handleAddCombo = async () => {
    if (!combo) return;
    setAdding(true);
    try {
      await addItem('COMBO', combo.id, quantity);
      toast.success(`Đã thêm "${combo.name}" vào giỏ hàng! ✨`, {
        style: {
          borderRadius: '20px',
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(231, 111, 81, 0.3)',
        },
      });
    } catch {
      toast.error('Không thể thêm Combo vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!combo) return (
    <div className="min-h-screen pt-32 text-center">
      <h2 className="text-2xl font-bold">Combo không tồn tại hoặc đã hết thời gian bán</h2>
      <button className="btn-secondary mt-4" onClick={() => navigate('/combos')}>Về danh sách combo</button>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate('/combos')}
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-accent transition-colors mb-6 text-xs font-bold"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span>Danh sách Set Combo Pass</span>
      </button>

      <div className="glass-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xl border border-white/60 dark:border-slate-800">
            <img 
              src={getComboImageUrl(combo)} 
              alt={combo.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute top-4 left-4 bg-accent text-white px-3.5 py-1 rounded-full text-xs font-black shadow-md">
              Special Combo Pass
            </div>

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg">
              Tiết kiệm ngay {combo.savingAmount ? `${combo.savingAmount.toLocaleString('vi-VN')}₫` : '30.000₫'}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-extrabold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gói Combo Thưởng Trà Chuẩn Trend 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif-title leading-tight mb-3">
                {combo.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-extrabold text-accent">
                  {(combo.finalPrice ?? combo.comboPrice).toLocaleString('vi-VN')}₫
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {combo.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {combo.description || 'Bộ combo phối hợp hương vị trà ủ lạnh độc quyền cùng bánh ngọt thủ công mang lại trải nghiệm ẩm thực trọn vẹn.'}
              </p>

              {/* Items included in Combo */}
              <div className="bg-slate-100/70 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Các Món Bao Gồm Trong Combo:</span>
                <div className="space-y-2">
                  {combo.items && combo.items.length > 0 ? (
                    combo.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-2 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          {it.product?.name || `Món món #${it.id}`}
                        </span>
                        <span className="text-slate-400 font-semibold">x{it.quantity}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-2 font-bold"><CheckCircle2 className="w-4 h-4 text-accent" /> Trà Ủ Lạnh Hữu Cơ Độc Quyền</span>
                        <span className="text-slate-400 font-semibold">x1</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-2 font-bold"><CheckCircle2 className="w-4 h-4 text-accent" /> Bánh Ngọt Pháp Thượng Hạng</span>
                        <span className="text-slate-400 font-semibold">x1</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button className="btn-secondary p-2" disabled={quantity <= 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={16} /></button>
              <span className="font-bold">Số lượng: {quantity}</span>
              <button className="btn-secondary p-2" onClick={() => setQuantity(value => value + 1)}><Plus size={16} /></button>
            </div>
            <button
              onClick={handleAddCombo}
              disabled={adding}
              className="w-full btn-accent py-4 text-sm font-extrabold shadow-lg flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              <span>Thêm Combo Vào Giỏ — {((combo.finalPrice ?? combo.comboPrice) * quantity).toLocaleString('vi-VN')}₫</span>
            </button>
          </div>

        </div>
      </div>
      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-6">Có Thể Bạn Sẽ Thích</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map(item => <ProductCard key={item.id} product={item.suggestedProduct} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ComboDetail;
