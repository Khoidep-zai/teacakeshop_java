import { useState, useEffect } from 'react';
import { getCombos, getHotCombos, getBestSellerCombos, getCombosByWeather } from '../api/combos';
import ComboCard from '../components/combos/ComboCard';
import type { Combo, WeatherType } from '../types';
import { Cloud, Sun, CloudRain, Snowflake, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

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
    } catch (error) {
      console.error('Failed to fetch combos', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 dark:text-gray-100 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-primary mb-3">Combo Trà & Bánh Khuyến Mãi</h1>
        <p className="text-gray-600 dark:text-gray-400">Sự kết hợp hoàn hảo giữa hương vị trà và bánh ngọt tinh tế với mức giá ưu đãi</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {[
          { id: 'all', label: 'Tất cả Combo' },
          { id: 'hot', label: '🔥 Nổi bật' },
          { id: 'best-sellers', label: '⭐ Bán chạy' },
          { id: 'weather', label: '🌤️ Theo thời tiết' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'weather' && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
          {WEATHERS.map((w) => {
            const Icon = w.icon;
            const selected = selectedWeather === w.value;
            return (
              <button
                key={w.value}
                onClick={() => setSelectedWeather(w.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selected ? 'bg-accent text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon size={16} />
                {w.label}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          Không có combo nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {combos.map((combo) => (
            <motion.div key={combo.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ComboCard combo={combo} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
