import { useState, useEffect } from 'react';
import { getCombos, getHotCombos, getBestSellerCombos, getCombosByWeather } from '../api/combos';
import ComboCard from '../components/combos/ComboCard';
import type { Combo, WeatherType } from '../types';
import { Cloud, Sun, CloudRain, Snowflake, Flame, Activity, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const WEATHERS: { value: WeatherType; label: string; icon: any }[] = [
  { value: 'SUNNY', label: 'Nắng ấm', icon: Sun },
  { value: 'RAINY', label: 'Trời mưa', icon: CloudRain },
  { value: 'COLD', label: 'Se lạnh', icon: Snowflake },
  { value: 'HOT', label: 'Nắng nóng', icon: Flame },
  { value: 'CLOUDY', label: 'Nhiều mây', icon: Cloud },
  { value: 'NORMAL', label: 'Tự nhiên', icon: Activity },
];

export default function Combos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'best-sellers' | 'weather'>('all');
  const [selectedWeather, setSelectedWeather] = useState<WeatherType>('SUNNY');

  useEffect(() => {
    fetchCombos();
  }, [activeTab, selectedWeather]);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      let result: any = [];
      if (activeTab === 'all') {
        const res = await getCombos();
        result = res.content || res;
      } else if (activeTab === 'hot') {
        result = await getHotCombos();
      } else if (activeTab === 'best-sellers') {
        result = await getBestSellerCombos();
      } else if (activeTab === 'weather') {
        result = await getCombosByWeather(selectedWeather);
      }
      setCombos(Array.isArray(result) ? result : []);
    } catch (error: any) {
      setCombos([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách combo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="glass-card p-8 sm:p-12 text-center mb-10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-extrabold text-xs uppercase tracking-widest mb-3">
          <Tag className="w-4 h-4" />
          <span>Tiết kiệm lên tới 25%</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-serif-title mb-3">
          Set Trà Chiều Combo Hoàng Gia
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Sự hòa quyện tuyệt hảo được đề xuất bởi nghệ nhân trà và AI Sommelier, mang đến trải nghiệm hương vị trọn vẹn với mức giá ưu đãi nhất.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        {[
          { id: 'all', label: 'Tất cả Combo Pass' },
          { id: 'hot', label: '🔥 Hot Trend 2026' },
          { id: 'best-sellers', label: '⭐ Bán chạy nhất' },
          { id: 'weather', label: '🌤️ Phối vị theo thời tiết' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/30 scale-105'
                : 'glass-card-static text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Weather Selector */}
      {activeTab === 'weather' && (
        <div className="flex flex-wrap justify-center gap-2.5 mb-10 p-4 glass-card-static max-w-2xl mx-auto">
          {WEATHERS.map((w) => {
            const Icon = w.icon;
            const selected = selectedWeather === w.value;
            return (
              <button
                key={w.value}
                onClick={() => setSelectedWeather(w.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selected
                    ? 'bg-slate-900 text-white shadow-md scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{w.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-80 animate-pulse"></div>
          ))}
        </div>
      ) : combos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {combos.map((combo) => (
            <motion.div key={combo.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ComboCard combo={combo} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-sm text-slate-500">
          Không có combo đang bán phù hợp.
        </div>
      )}

    </div>
  );
}
