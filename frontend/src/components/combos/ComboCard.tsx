import { Combo } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, CloudRain, Sun, Snowflake, Flame, Cloud, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

interface ComboCardProps {
  combo: Combo;
  onAddToCart?: () => void;
}

const getWeatherIcon = (weatherType?: string) => {
  switch (weatherType) {
    case 'SUNNY': return <Sun size={14} className="text-amber-400" />;
    case 'RAINY': return <CloudRain size={14} className="text-blue-400" />;
    case 'COLD': return <Snowflake size={14} className="text-sky-300" />;
    case 'HOT': return <Flame size={14} className="text-orange-500" />;
    case 'CLOUDY': return <Cloud size={14} className="text-slate-400" />;
    default: return <Activity size={14} className="text-emerald-400" />;
  }
};

export default function ComboCard({ combo, onAddToCart }: ComboCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const savings = combo.savingAmount || (combo.originalPrice - combo.comboPrice);

  const getComboImage = () => {
    if (combo.imageUrl && combo.imageUrl !== '/favicon.svg') return combo.imageUrl;
    return '/images/combos/royal_tea_set.png';
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      try {
        await addItem('COMBO', combo.id, 1);
        toast.success(`Đã thêm combo "${combo.name}" vào giỏ! ✨`, {
          style: {
            borderRadius: '20px',
            background: '#0F172A',
            color: '#fff',
            border: '1px solid rgba(231, 111, 81, 0.3)',
          },
          iconTheme: {
            primary: '#E76F51',
            secondary: '#FFFFFF',
          },
        });
      } catch {
        toast.error('Không thể thêm combo vào giỏ hàng');
      }
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="glass-card p-4 flex flex-col cursor-pointer group relative overflow-hidden h-full"
      onClick={() => navigate(`/combos/${combo.id}`)}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all pointer-events-none" />

      {/* Image Banner */}
      <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4 shadow-sm">
        <img 
          src={getComboImage()} 
          alt={combo.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Weather Tag */}
        {combo.weatherType && (
          <div className="absolute top-3 left-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/40 dark:border-slate-700/40">
            {getWeatherIcon(combo.weatherType)}
            <span className="capitalize">{combo.weatherType.toLowerCase()}</span>
          </div>
        )}

        {/* Discount Badge */}
        {savings > 0 && combo.originalPrice > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-accent to-accent-light text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
            <Tag size={12} />
            -{(savings / combo.originalPrice * 100).toFixed(0)}%
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" />
          <span>Royal Tier Pass</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 font-serif-title group-hover:text-accent transition-colors">
            {combo.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-3 leading-relaxed">
            {combo.description || 'Set trà chiều phong cách hoàng gia phối hợp bánh tươi chuẩn khẩu vị.'}
          </p>
        </div>
        
        {/* Savings Tag */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="bg-primary/10 text-primary dark:bg-primary-glow/20 dark:text-primary-glow px-2.5 py-1 rounded-xl font-bold">
            {combo.items?.length || 2} món đặc sắc
          </span>
          {savings > 0 && (
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl font-bold border border-emerald-500/20">
              Tiết kiệm {savings.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            {savings > 0 && (
              <p className="text-xs text-slate-400 line-through">
                {combo.originalPrice?.toLocaleString('vi-VN')}₫
              </p>
            )}
            <p className="text-xl font-extrabold text-accent">
              {combo.comboPrice?.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <button 
            onClick={handleAdd}
            className="w-10 h-10 rounded-xl bg-accent text-white hover:bg-accent-dark flex items-center justify-center transition-all duration-300 shadow-md shadow-accent/30 active:scale-95"
            title="Thêm Combo vào giỏ"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
