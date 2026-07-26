import React, { useState } from 'react';
import { ShoppingCart, Loader2, CloudRain, Sun, Snowflake, ArrowRight } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Combo } from '../../types';
import { fallbackCombos } from '../../data/mockCatalog';

interface ComboCardProps {
  combo: Combo;
}

const ComboCard: React.FC<ComboCardProps> = ({ combo }) => {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const getComboImage = () => {
    if (combo.imageUrl && combo.imageUrl !== '/favicon.svg') return combo.imageUrl;
    const found = fallbackCombos.find(c => c.id === combo.id);
    if (found) return found.imageUrl;
    if (combo.id === 2) return '/images/combos/combo_rainy.png';
    if (combo.id === 3) return '/images/combos/combo_energy.png';
    return '/images/combos/royal_tea_set.png';
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case 'RAINY':
        return <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold"><CloudRain size={12} /> Se lạnh đêm mưa</span>;
      case 'SUNNY':
        return <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold"><Sun size={12} /> Nắng ấm thanh mát</span>;
      case 'COLD':
        return <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold"><Snowflake size={12} /> Năng lượng đột phá</span>;
      default:
        return null;
    }
  };

  const handleAddCombo = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem('COMBO', combo.id, 1);
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

  return (
    <Link to={`/combos/${combo.id}`} className="group glass-card p-5 flex flex-col justify-between h-full relative overflow-hidden border border-white/60 dark:border-slate-800">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors pointer-events-none" />

      <div>
        {/* Image Box */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 shadow-sm">
          <img 
            src={getComboImage()} 
            alt={combo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              Combo Pass
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md">
            Tiết kiệm {combo.savingAmount ? `${combo.savingAmount.toLocaleString('vi-VN')}₫` : '30.000₫'}
          </div>
        </div>

        {/* Content */}
        <div className="mb-2">
          {getWeatherIcon(combo.weatherType)}
        </div>

        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white font-serif-title group-hover:text-accent transition-colors line-clamp-1">
          {combo.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {combo.description || 'Bộ kết hợp hoàn hảo giữa món trà ủ lạnh độc quyền và bánh ngọt Pháp cao cấp.'}
        </p>
      </div>

      {/* Footer / Price & Add */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 line-through block">
            {combo.originalPrice.toLocaleString('vi-VN')}₫
          </span>
          <span className="text-xl font-extrabold text-accent">
            {combo.comboPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddCombo}
            disabled={adding}
            className="btn-accent px-4 py-2.5 text-xs font-extrabold flex items-center gap-1.5 shadow-md"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            <span>Thêm Combo</span>
          </button>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ComboCard;
