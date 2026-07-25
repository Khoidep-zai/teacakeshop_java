import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHotProducts } from '../api/products';
import { getHotCombos } from '../api/combos';
import ProductCard from '../components/products/ProductCard';
import ComboCard from '../components/combos/ComboCard';
import type { Product, Combo } from '../types';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [hotCombos, setHotCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prods, cmbs] = await Promise.allSettled([
          getHotProducts(),
          getHotCombos()
        ]);
        if (prods.status === 'fulfilled') setHotProducts(prods.value || []);
        if (cmbs.status === 'fulfilled') setHotCombos(cmbs.value || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <span className="inline-flex items-center gap-1.5 py-1 px-4 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase mb-2">
              <Sparkles size={16} /> TeaCake Shop
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {t('home.hero_title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Tea & Sweet Cakes
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/products" className="bg-primary hover:bg-opacity-90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2">
                <Coffee size={24} /> {t('home.hero_cta')}
              </Link>
              <Link to="/reservation" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center gap-2">
                <Heart size={24} className="text-accent" /> {t('home.hero_cta2')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen"></div>
        </div>
      </section>

      {/* Hot Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('home.hot_products')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('home.best_sellers')}</p>
          </div>
          <Link to="/products" className="text-primary font-bold hover:underline flex items-center gap-1 group">
            {t('home.view_all')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse h-72"></div>
            ))}
          </div>
        ) : hotProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">{t('products.no_products')}</div>
        )}
      </section>

      {/* Hot Combos Section */}
      {hotCombos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('home.featured_combos')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('combos.subtitle')}</p>
            </div>
            <Link to="/combos" className="text-accent font-bold hover:underline flex items-center gap-1 group">
              {t('home.view_all')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotCombos.slice(0, 3).map(combo => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
