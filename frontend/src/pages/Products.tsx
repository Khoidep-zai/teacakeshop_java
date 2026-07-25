import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter, X, Coffee } from 'lucide-react';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import ProductCard from '../components/products/ProductCard';
import { Product, Category } from '../types';

const Products: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TEA' | 'CAKE'>('ALL');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'hot'>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts((productsData as any).content ?? productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products
    .filter(p => activeTab === 'ALL' || p.productType === activeTab)
    .filter(p => !activeCategory || p.categoryId === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'hot') return (b.hotScore || 0) - (a.hotScore || 0);
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-24 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('products.title', 'Thực đơn')}
          </h1>
          
          <div className="w-full md:w-auto flex gap-2">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder={t('products.search', 'Tìm kiếm trà, bánh ngọt...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button 
              className="md:hidden bg-primary text-white p-2 rounded-lg"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter (Desktop) */}
          <div className={`md:w-64 flex-shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{t('products.filters', 'Bộ lọc')}</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Type Tabs */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('products.type', 'Loại sản phẩm')}</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'ALL', label: t('products.all', 'Tất cả') },
                    { key: 'TEA', label: t('products.tea', 'Trà') },
                    { key: 'CAKE', label: t('products.cake', 'Bánh ngọt') }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key as any);
                        setActiveCategory(null);
                      }}
                      className={`text-left px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.key
                          ? 'bg-primary text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('products.filter_by_category', 'Danh mục')}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      activeCategory === null
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary'
                    }`}
                  >
                    {t('products.all', 'Tất cả')}
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        activeCategory === category.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('products.sort', 'Sắp xếp')}</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="newest">{t('products.newest', 'Mới nhất')}</option>
                  <option value="price-asc">{t('products.price_asc', 'Giá tăng dần')}</option>
                  <option value="price-desc">{t('products.price_desc', 'Giá giảm dần')}</option>
                  <option value="hot">{t('products.hot', 'Bán chạy nhất')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-80 animate-pulse p-4 flex flex-col">
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-auto"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <Coffee className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('products.no_products', 'Không tìm thấy sản phẩm')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('products.try_different_filters', 'Thử điều chỉnh từ khóa hoặc bộ lọc để tìm kiếm.')}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory(null);
                    setActiveTab('ALL');
                  }}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-opacity-90 transition-colors"
                >
                  {t('products.clear_filters', 'Xóa bộ lọc')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
