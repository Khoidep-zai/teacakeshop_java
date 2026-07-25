import { Combo } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Tag, CloudRain, Sun, Snowflake, Flame, Cloud, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

interface ComboCardProps {
  combo: Combo;
  onAddToCart?: () => void;
}

const getWeatherIcon = (weatherType?: string) => {
  switch (weatherType) {
    case 'SUNNY': return <Sun size={14} />;
    case 'RAINY': return <CloudRain size={14} />;
    case 'COLD': return <Snowflake size={14} />;
    case 'HOT': return <Flame size={14} />;
    case 'CLOUDY': return <Cloud size={14} />;
    default: return <Activity size={14} />;
  }
};

export default function ComboCard({ combo, onAddToCart }: ComboCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const savings = combo.savingAmount || (combo.originalPrice - combo.comboPrice);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      try {
        await addItem('COMBO', combo.id, 1);
        toast.success(`Đã thêm ${combo.name} vào giỏ!`);
      } catch {
        toast.error('Không thể thêm combo vào giỏ');
      }
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col cursor-pointer"
      onClick={() => navigate(`/combos/${combo.id}`)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img 
          src={combo.imageUrl || '/favicon.svg'} 
          alt={combo.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {combo.weatherType && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-800 dark:text-gray-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            {getWeatherIcon(combo.weatherType)}
            {combo.weatherType}
          </div>
        )}
        {savings > 0 && combo.originalPrice > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Tag size={12} />
            -{(savings / combo.originalPrice * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{combo.name}</h3>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {combo.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2 py-1 rounded-md font-medium">
            {combo.items?.length || 0} món
          </span>
          {savings > 0 && (
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md font-medium">
              Tiết kiệm {savings.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div>
            {savings > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 line-through mb-0.5">
                {combo.originalPrice?.toLocaleString('vi-VN')}₫
              </p>
            )}
            <p className="text-xl font-bold text-accent dark:text-accent">
              {combo.comboPrice?.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-full transition-colors shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
