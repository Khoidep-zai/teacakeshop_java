import React, { useEffect, useState } from 'react';
import { ArrowRight, Coffee, Heart, Sparkles, Star, ShieldCheck, Award, Flame, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBestSellerProducts, getHotProducts } from '../api/products';
import { getHotCombos } from '../api/combos';
import { getActiveDiscounts } from '../api/discounts';
import ProductCard from '../components/products/ProductCard';
import ComboCard from '../components/combos/ComboCard';
import { AISommelierWidget } from '../components/ui/AISommelierWidget';
import type { Product, Combo, Discount } from '../types';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [hotCombos, setHotCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prods, bestSellers, cmbs, discountResult] = await Promise.allSettled([
          getHotProducts(),
          getBestSellerProducts(),
          getHotCombos(),
          getActiveDiscounts(),
        ]);
        setHotProducts(prods.status === 'fulfilled' ? prods.value : []);
        setBestSellerProducts(bestSellers.status === 'fulfilled' ? bestSellers.value : []);
        setHotCombos(cmbs.status === 'fulfilled' ? cmbs.value : []);
        setDiscounts(discountResult.status === 'fulfilled' ? discountResult.value : []);
        if (prods.status === 'rejected' || cmbs.status === 'rejected') {
          toast.error('Một số nội dung trang chủ chưa thể tải. Vui lòng thử lại.');
        }
      } catch (e) {
        setHotProducts([]);
        setBestSellerProducts([]);
        setHotCombos([]);
        setDiscounts([]);
        toast.error('Không thể tải dữ liệu trang chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-20 pb-20 pt-28">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-card p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          
          {/* Background Ambient Glowing Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyber-teal/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text Banner */}
          <div className="w-full lg:w-3/5 space-y-6 relative z-10 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/90 text-white text-xs font-bold border border-cyber-teal/30 shadow-md">
              <Sparkles className="w-4 h-4 text-cyber-teal animate-spin-slow" />
              <span>Xu hướng Trải nghiệm Trà & Bánh 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] font-serif-title">
              Nghệ Thuật Trà Chiều <br />
              <span className="gradient-text-matcha">Cyber-Organic</span> & AI Touch
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Thưởng thức tinh hoa hương vị trà thủ công phối cùng pastry chuẩn Pháp, được nâng tầm bởi trợ lý AI Sommelier giúp cá nhân hóa trải nghiệm vị giác của riêng bạn.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/products" className="btn-primary text-sm sm:text-base py-3.5 px-8">
                <Coffee className="w-5 h-5" />
                <span>Khám phá Thực đơn 2026</span>
              </Link>
              <Link to="/reservation" className="btn-secondary text-sm sm:text-base py-3.5 px-8">
                <Heart className="w-5 h-5 text-accent" />
                <span>Đặt Bàn Không Gian Lounge</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="block font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white font-serif-title">100%</span>
                <span className="text-xs text-slate-500">Trà hữu cơ tuyển chọn</span>
              </div>
              <div>
                <span className="block font-extrabold text-xl sm:text-2xl text-primary-light font-serif-title">4.9 ★</span>
                <span className="text-xs text-slate-500">Đánh giá 10,000+ khách</span>
              </div>
              <div>
                <span className="block font-extrabold text-xl sm:text-2xl text-cyber-teal font-serif-title">AI Pair</span>
                <span className="text-xs text-slate-500">Phối vị chuẩn xác</span>
              </div>
            </div>

          </div>

          {/* Right Floating Visual Showcase */}
          <div className="w-full lg:w-2/5 relative flex justify-center">
            <div className="relative w-72 sm:w-80 aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-primary/30 border-4 border-white/80 dark:border-slate-800 animate-float">
              <img
                src="/images/products/matcha_cake.png"
                alt="Signature Matcha Cake"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold font-serif-title text-emerald-300">Matcha Mousse Layered</span>
                  <span className="text-amber-400 font-extrabold text-[11px]">Best Seller 2026</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1">Lớp kem matcha mịn màng hòa quyện nốt hương trà đắng nhẹ.</p>
              </div>
            </div>

            {/* Secondary Floating Pill */}
            <div className="absolute -bottom-6 -left-4 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                🍵
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">Trà Ủ Lạnh Cold Brew</span>
                <span className="text-[11px] text-slate-400">Ủ lạnh 12h giữ nguyên tanin</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive AI Sommelier Feature Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AISommelierWidget />
      </section>

      {discounts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h2 className="section-title mb-5">Khuyến Mãi Đang Áp Dụng</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {discounts.slice(0, 3).map(discount => (
              <div key={discount.id} className="glass-card p-5">
                <p className="font-mono text-xs font-bold text-accent">{discount.code}</p>
                <h3 className="font-bold text-lg mt-1">{discount.name}</h3>
                <p className="text-sm text-primary font-extrabold mt-2">
                  {discount.discountType === 'PERCENTAGE'
                    ? `Giảm ${discount.discountValue}%`
                    : `Giảm ${discount.discountValue.toLocaleString('vi-VN')}₫`}
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Đến {new Date(discount.endAt).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hot Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
              <Flame className="w-4 h-4 text-accent" />
              <span>Sản phẩm nổi bật</span>
            </div>
            <h2 className="section-title">Danh Mục Bánh & Trà Đặc Sắc</h2>
          </div>
          <Link to="/products" className="btn-secondary text-xs px-5 py-2.5 flex items-center gap-2 group">
            <span>Xem tất cả sản phẩm</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {!loading && bestSellerProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-accent">Được khách hàng yêu thích</p>
              <h2 className="section-title">Sản Phẩm Bán Chạy</h2>
            </div>
            <Link to="/products?sort=best-sellers" className="btn-secondary text-xs">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellerProducts.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}

      {/* Featured Combos Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card-static p-8 sm:p-10 bg-gradient-to-r from-emerald-900/10 via-slate-900/10 to-amber-900/10 border border-slate-200/60 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-1">
                <Zap className="w-4 h-4" />
                <span>Ưu Đãi Set Trà Chiều</span>
              </div>
              <h2 className="section-title">Combo Phối Vị Tiết Kiệm</h2>
            </div>
            <Link to="/combos" className="btn-accent text-xs px-5 py-2.5 flex items-center gap-2 group">
              <span>Khám phá các Combo</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotCombos.slice(0, 3).map(combo => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars of Experience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Giá Trị Cốt Lõi</span>
          <h2 className="section-title mt-1">Trải Nghiệm Đẳng Cấp Tại Tea & Cake Lounge</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Trà Hữu Cơ Tuyển Chọn', desc: 'Trà được thu hái từ những đồi trà lâu đời, ủ lạnh đúng chuẩn để giữ trọn nốt hương vị tự nhiên.', icon: Award, color: 'text-emerald-500' },
            { title: 'Bánh Tươi Mỗi Giờ', desc: 'Công thức bánh ít ngọt Pháp được nướng mới liên tục trong ngày, dùng nguyên liệu cao cấp 100%.', icon: ShieldCheck, color: 'text-amber-500' },
            { title: 'Trợ Lý AI Phối Vị', desc: 'Công nghệ AI Sommelier đầu tiên tại Việt Nam phân tích vị giác và gợi ý combo bánh trà chuẩn xác.', icon: Sparkles, color: 'text-cyber-teal' },
            { title: 'Không Gian Lounge 2.5D', desc: 'Thiết kế hiện đại kết hợp ánh sáng dịu và âm thanh ambient đem lại cảm giác chill tuyệt đối.', icon: Heart, color: 'text-rose-500' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card p-6 flex flex-col items-start text-left space-y-3">
                <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white font-serif-title">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card p-8 sm:p-12 relative overflow-hidden text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyber-teal">Cảm Nhận Khách Hàng</span>
          <h2 className="section-title mt-1 mb-8">Trải Nghiệm Đáng Nhớ Cùng Chúng Tôi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { name: 'Minh Anh', role: 'Food Reviewer', text: 'Bánh Matcha ở đây có độ đắng thanh hiếm thấy, kết hợp tính năng AI gợi ý món uống siêu chuẩn làm mình ấn tượng!', rating: 5 },
              { name: 'Hoàng Nam', role: 'Architect', text: 'Không gian Lounge thiết kế rất futuristic nhưng vẫn vô cùng ấm cúng. Trà Oolong ủ lạnh ngon đỉnh cao.', rating: 5 },
              { name: 'Thu Thảo', role: 'UI/UX Designer', text: 'Giao diện web mượt mà, đặt bàn online lấy chỗ view đẹp cực kỳ nhanh chóng. Rất đáng trải nghiệm!', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 gap-1 mb-3">
                    {[...Array(review.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{review.text}"</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-700/40">
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">{review.name}</span>
                  <span className="text-[11px] text-slate-400">{review.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
