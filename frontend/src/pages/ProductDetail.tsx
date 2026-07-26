import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Thermometer, ChevronLeft, Loader2, ArrowLeft, Sparkles, Star } from 'lucide-react';
import { getProduct, getProductSuggestions } from '../api/products';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/products/ProductCard';
import type { Product, ProductSuggestion } from '../types';
import { getProductImageUrl } from '../utils/imageHelpers';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      const numId = Number(id);
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const productData = await getProduct(numId);
        setProduct(productData);
        try {
          const suggestionsData = await getProductSuggestions(numId);
          setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
        } catch {
          setSuggestions([]);
        }
      } catch (error: any) {
        setProduct(null);
        setSuggestions([]);
        toast.error(error?.response?.data?.message || 'Không tìm thấy sản phẩm đang bán.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem('PRODUCT', product.id, quantity);
      toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng! ✨`, {
        style: {
          borderRadius: '20px',
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(82, 183, 136, 0.3)',
        },
      });
    } catch (e) {
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Không tìm thấy món ăn này
        </h2>
        <button 
          onClick={() => navigate('/products')}
          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Thực Đơn Sản Phẩm</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors mb-6 text-xs font-bold"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span>Quay lại trang trước</span>
      </button>

      <div className="glass-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Image & Badges */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xl border border-white/60 dark:border-slate-800">
            <img 
              src={getProductImageUrl(product)} 
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black shadow-md border border-white/20">
                {product.categoryName || 'Boutique Artisan'}
              </span>
              {product.productType && (
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
                  {product.productType === 'TEA' ? '🍵 Trà Thuần' : '🍰 Bánh Thủ Công'}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-cyber-teal to-cyber-violet text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Sommelier Choice</span>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                  <span className="text-slate-400 text-xs font-normal ml-1">(245 lượt đánh giá)</span>
                </div>
                {product.temperatureType && (
                  <div className="flex items-center text-slate-600 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 font-bold">
                    <Thermometer className="w-3.5 h-3.5 mr-1 text-accent" />
                    {product.temperatureType === 'BOTH' ? 'Nóng & Lạnh' : product.temperatureType === 'HOT' ? 'Thưởng Nóng' : 'Ủ Lạnh'}
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif-title leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-extrabold text-primary dark:text-primary-glow">
                  {(product.finalPrice ?? product.price).toLocaleString('vi-VN')}₫
                </span>
                {(product.finalPrice ?? product.price) < product.price && (
                  <span className="text-sm text-slate-400 line-through">{product.price.toLocaleString('vi-VN')}₫</span>
                )}
                <span className="text-xs text-slate-400 font-semibold">Bao gồm VAT & Đóng gói Eco-glass</span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {product.description || 'Sản phẩm được chế tác thủ công bởi các nghệ nhân giàu kinh nghiệm, kết hợp nguyên liệu hữu cơ cao cấp nhập khẩu trực tiếp.'}
              </p>

              {/* Flavor Profile Breakdown Bar */}
              <div className="bg-slate-100/70 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3 mb-6">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Đặc Tính Hương Vị (Flavor Radar)</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Độ Ngọt:</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-1 overflow-hidden">
                      <div className="bg-amber-400 h-full w-[40%]" />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Đậm Đà (Body):</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-1 overflow-hidden">
                      <div className="bg-primary h-full w-[85%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Cart Action */}
            <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Số lượng:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-extrabold text-slate-900 dark:text-white text-sm">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stockQuantity <= 0}
                  className="flex-1 btn-primary py-4 text-sm font-extrabold shadow-lg"
                >
                  {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                  <span>{product.stockQuantity <= 0 ? 'Tạm hết hàng' : `Thêm Vào Giỏ — ${((product.finalPrice ?? product.price) * quantity).toLocaleString('vi-VN')}₫`}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Suggested Pairings */}
      {suggestions.length > 0 && (
        <div className="mt-16">
          <h2 className="section-title text-center mb-8">Món Gợi Ý Phối Hợp Tuyệt Vời</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((item) => (
              <ProductCard key={item.id} product={item.suggestedProduct} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
