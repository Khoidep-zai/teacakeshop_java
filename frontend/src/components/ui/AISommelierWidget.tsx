import React, { useState } from 'react';
import { Sparkles, Compass, Heart, Zap, Moon, Sun, Coffee, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

export const AISommelierWidget: React.FC = () => {
  const [mood, setMood] = useState<'relax' | 'focus' | 'romantic' | 'energy'>('relax');
  const [sweetness, setSweetness] = useState<number>(30);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    teaName: string;
    cakeName: string;
    score: number;
    description: string;
    imageUrl: string;
  } | null>(null);

  const { addItem } = useCart();

  const handleRecommend = () => {
    setAnalyzing(true);
    setRecommendation(null);
    setTimeout(() => {
      let rec = {
        teaName: 'Trà Oolong Kim Tuyên Ủ Lạnh',
        cakeName: 'Bánh Matcha Layered Mousse',
        score: 98,
        description: 'Vị đắng thanh của Matcha đền bù mượt mà cho hương hoa mộc trà Oolong, tạo nốt hương thư thái hoàn hảo cho buổi chiều.',
        imageUrl: '/images/products/matcha_cake.png',
      };
      if (mood === 'energy') {
        rec = {
          teaName: 'Trà Earl Grey Chanh Vải Interstellar',
          cakeName: 'Tart Chocolate Truffle Đắng 70%',
          score: 96,
          description: 'Hương citrus Earl Grey đánh thức giác quan kết hợp vị đắng cacao nguyên bản tiếp thêm năng lượng đỉnh cao.',
          imageUrl: '/images/products/earl_grey.png',
        };
      } else if (mood === 'romantic') {
        rec = {
          teaName: 'Trà Hoa Anh Đào Vải Mộc',
          cakeName: 'Chiffon Dâu Tây Kem Tươi',
          score: 99,
          description: 'Sắc hồng nhẹ nhàng của hoa anh đào quyện cùng hương ngọt lịm ngọt ngào của dâu tây Pháp.',
          imageUrl: '/images/products/sakura_tea.png',
        };
      }
      setRecommendation(rec);
      setAnalyzing(false);
    }, 1200);
  };

  const handleAddPair = async () => {
    if (!recommendation) return;
    try {
      await addItem('PRODUCT', 1, 1); // Add default matched items
      toast.success(`Đã thêm bộ phối vị AI "${recommendation.teaName} + ${recommendation.cakeName}" vào giỏ! ✨`, {
        style: {
          borderRadius: '20px',
          background: '#0F172A',
          color: '#fff',
          border: '1px solid rgba(6, 182, 212, 0.4)',
        },
      });
    } catch {
      toast.error('Có lỗi khi thêm bộ phối vị');
    }
  };

  return (
    <div className="relative glass-card-static p-6 sm:p-8 overflow-hidden border border-cyber-teal/30 shadow-glow-cyber">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyber-teal/10 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyber-violet/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        
        {/* Left Column: Interactive Controls */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-r from-cyber-teal to-cyber-violet text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-cyber-teal">Tính năng Đột phá 2026</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-serif-title">
                AI Sommelier — Phối Vị Thông Minh
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Chọn tâm trạng và mức độ ngọt bạn mong muốn, thuật toán AI Sommelier của Tea & Cake Lounge sẽ phân tích cấu trúc vị giác và gợi ý cặp Trà & Bánh hoàn hảo dành riêng cho bạn.
          </p>

          {/* Selector 1: Mood */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              1. Tâm trạng của bạn hôm nay?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'relax', label: 'Thư giãn', icon: Compass, color: 'text-emerald-500' },
                { id: 'focus', label: 'Tập trung', icon: Zap, color: 'text-amber-500' },
                { id: 'romantic', label: 'Lãng mạn', icon: Heart, color: 'text-rose-500' },
                { id: 'energy', label: 'Tươi mới', icon: Sun, color: 'text-sky-500' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = mood === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMood(item.id as any)}
                    className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-cyber-teal shadow-md shadow-cyber-teal/20 scale-[1.02]'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyber-teal/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector 2: Sweetness Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Mức độ vị ngọt mong muốn:
              </label>
              <span className="text-xs font-black text-cyber-teal bg-cyber-teal/10 px-2 py-0.5 rounded-md">
                {sweetness < 30 ? 'Ít ngọt (Thanh dịu)' : sweetness < 70 ? 'Vừa vặn (Cân bằng)' : 'Ngọt đượm (Đậm đà)'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sweetness}
              onChange={(e) => setSweetness(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyber-teal"
            />
          </div>

          {/* Selector 3: Time of day */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              3. Khung giờ thưởng trà:
            </label>
            <div className="flex gap-2">
              {[
                { id: 'morning', label: 'Nắng Sáng (8h-11h)', icon: Sun },
                { id: 'afternoon', label: 'Trà Chiều (13h-17h)', icon: Coffee },
                { id: 'evening', label: 'Đêm Thư Thái (18h-22h)', icon: Moon },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = timeOfDay === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTimeOfDay(item.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleRecommend}
            disabled={analyzing}
            className="w-full btn-ai py-3.5 text-sm font-extrabold shadow-lg"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI Sommelier đang phân tích vị giác...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Phân tích & Gợi ý Cặp Vị Hoàn Hảo</span>
              </span>
            )}
          </button>
        </div>

        {/* Right Column: Recommendation Result Display */}
        <div className="w-full lg:w-1/2 min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-8 text-center space-y-4"
              >
                <div className="relative w-20 h-20 rounded-full border-4 border-cyber-teal/30 border-t-cyber-teal animate-spin flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-cyber-teal animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 animate-pulse">
                  Đang ghép nối chỉ số Tanin trà & độ béo của kem bánh...
                </p>
              </motion.div>
            ) : recommendation ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full bg-slate-900 text-white rounded-3xl p-6 border border-cyber-teal/40 shadow-xl relative overflow-hidden"
              >
                {/* Score Pill */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-400 to-cyber-teal text-slate-950 font-black px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{recommendation.score}% Vị Giác Match</span>
                </div>

                <span className="text-[10px] uppercase tracking-widest text-cyber-teal font-extrabold block mb-2">
                  Kết Quả Phối Vị AI Đề Xuất
                </span>

                <div className="flex items-center gap-4 my-3">
                  <img
                    src={recommendation.imageUrl}
                    alt="Pair preview"
                    className="w-20 h-20 rounded-2xl object-cover border border-white/20 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-lg font-serif-title text-emerald-300">
                      {recommendation.teaName}
                    </h4>
                    <span className="text-xs text-slate-400 font-bold block">+</span>
                    <h4 className="font-bold text-lg font-serif-title text-amber-300">
                      {recommendation.cakeName}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 leading-relaxed mb-4">
                  "{recommendation.description}"
                </p>

                <button
                  onClick={handleAddPair}
                  className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 rounded-xl"
                >
                  <span>Đặt Trọn Bộ Phối Vị Ngay (165.000₫)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-8 space-y-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl w-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyber-teal/10 text-cyber-teal mx-auto flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-slate-800 dark:text-white font-serif-title">
                  Khám phá Cặp Trà & Bánh dành riêng cho bạn
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Điều chỉnh các thông số bên trái và bấm nút phân tích để nhận kết quả phối vị từ AI.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
