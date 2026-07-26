import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter, X, Coffee, Sparkles } from 'lucide-react';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import ProductCard from '../components/products/ProductCard';
import type { Product, Category, Page } from '../types';
import toast from 'react-hot-toast';

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
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch((error: any) => toast.error(error?.response?.data?.message || 'Không thể tải danh mục.'));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await getProducts({
          keyword: searchTerm.trim() || undefined,
          type: activeTab === 'ALL' ? undefined : activeTab,
          categoryId: activeCategory || undefined,
          inStock: onlyInStock || undefined,
          hot: sortBy === 'hot' ? true : undefined,
          sort: sortBy === 'hot' ? 'newest' : sortBy,
          page,
          size: 9,
        }) as Page<Product>;
        setProducts(result.content || []);
        setTotalPages(result.totalPages || 0);
      } catch (error: any) {
        setProducts([]);
        setTotalPages(0);
        toast.error(error?.response?.data?.message || 'Không thể tải sản phẩm.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm, activeTab, activeCategory, sortBy, onlyInStock, page]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header & Search Bar */}
      <div className="glass-card p-6 sm:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Thực Đơn Nghệ Thuật 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Bộ Sưu Tập Trà & Bánh
          </h1>
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t('products.search', 'Tìm kiếm trà, bánh ngọt...')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="input-field pl-11 text-xs sm:text-sm"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            className="md:hidden p-3 rounded-2xl bg-primary text-white"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filter */}
        <div className={`md:w-64 flex-shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="glass-card-static p-6 sticky top-24 space-y-6">
            
            <div className="flex justify-between items-center md:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif-title">{t('products.filters', 'Bộ lọc sản phẩm')}</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Type Tabs */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Loại Sản Phẩm</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { key: 'ALL', label: 'Tất cả Thực đơn' },
                  { key: 'TEA', label: '🍵 Trà Tuyển Chọn' },
                  { key: 'CAKE', label: '🍰 Bánh Thủ Công' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key as any);
                      setActiveCategory(null);
                      setPage(0);
                    }}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Danh Mục Món</h3>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setActiveCategory(null); setPage(0); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activeCategory === null
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => { setActiveCategory(category.id); setPage(0); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        activeCategory === category.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Sắp Xếp Giá</h3>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setPage(0); }}
                className="input-field text-xs font-semibold"
              >
                <option value="newest">Mới nhất 2026</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="hot">Sản phẩm nổi bật</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={onlyInStock} onChange={e => { setOnlyInStock(e.target.checked); setPage(0); }} />
              Chỉ hiển thị sản phẩm còn hàng
            </label>

          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-80 animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center">
              <Coffee className="w-14 h-14 text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title mb-2">
                Không tìm thấy món phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                Thử đổi từ khóa tìm kiếm hoặc bấm nút bên dưới để xóa các bộ lọc.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory(null);
                  setActiveTab('ALL');
                  setOnlyInStock(false);
                  setPage(0);
                }}
                className="btn-primary text-xs px-6 py-2.5"
              >
                Xóa Bộ Lọc Tìm Kiếm
              </button>
            </div>
          )}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button className="btn-secondary text-xs" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trang trước</button>
              <span className="text-xs font-bold">Trang {page + 1}/{totalPages}</span>
              <button className="btn-secondary text-xs" disabled={page + 1 >= totalPages} onClick={() => setPage(value => value + 1)}>Trang sau</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;
