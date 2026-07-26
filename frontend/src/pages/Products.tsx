import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter, X, Coffee, Sparkles } from 'lucide-react';
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

  const fallbackCatalog: Product[] = [
    { id: 1, name: 'Bánh Matcha Mousse Layered', description: 'Matcha Uji Nhật Bản 3 lớp mềm mịn phủ lá vàng nghệ thuật.', price: 75000, productType: 'CAKE', categoryId: 1, categoryName: 'Bánh Pháp', stockQuantity: 20, taste: 'Ngọt nhẹ, đắng thanh', temperatureType: 'BOTH', season: 'ALL', imageUrl: '/images/products/matcha_cake.png', active: true, hotScore: 99, bestSellerScore: 95, createdAt: new Date().toISOString() },
    { id: 2, name: 'Bánh Earl Grey Chiffon Lavender', description: 'Cốt bánh chiffon trà Earl Grey thơm nồng với lớp kem lavender dâu tây.', price: 82000, productType: 'CAKE', categoryId: 1, categoryName: 'Bánh Pháp', stockQuantity: 15, taste: 'Hương trà thơm ngát', temperatureType: 'BOTH', season: 'ALL', imageUrl: '/images/products/earl_grey.png', active: true, hotScore: 90, bestSellerScore: 88, createdAt: new Date().toISOString() },
    { id: 3, name: 'Trà Sakura Lychee Rose Ủ Lạnh', description: 'Chiết xuất hoa anh đào Nhật Bản, vải tươi ngâm nụ hồng hữu cơ.', price: 68000, productType: 'TEA', categoryId: 2, categoryName: 'Trà Ủ Lạnh', stockQuantity: 30, taste: 'Thanh mát, thơm ngọt', temperatureType: 'COLD', season: 'SUMMER', imageUrl: '/images/products/sakura_tea.png', active: true, hotScore: 96, bestSellerScore: 92, createdAt: new Date().toISOString() },
    { id: 4, name: 'Trà Oolong Kim Tuyên Hoàng Gia', description: 'Trà Oolong núi cao hương sữa tự nhiên ủ lạnh trong suốt 12 tiếng.', price: 65000, productType: 'TEA', categoryId: 2, categoryName: 'Trà Ủ Lạnh', stockQuantity: 25, taste: 'Đượm hậu vị', temperatureType: 'COLD', season: 'ALL', imageUrl: '/images/products/sakura_tea.png', active: true, hotScore: 92, bestSellerScore: 90, createdAt: new Date().toISOString() },
    { id: 5, name: 'Tart Chocolate Truffle Đắng 70%', description: 'Lớp nhân chocolate Bỉ đắng hòa quyện vỏ tart giòn bơ Pháp.', price: 88000, productType: 'CAKE', categoryId: 1, categoryName: 'Bánh Pháp', stockQuantity: 12, taste: 'Đậm đà nồng nàn', temperatureType: 'BOTH', season: 'ALL', imageUrl: '/images/products/earl_grey.png', active: true, hotScore: 88, bestSellerScore: 86, createdAt: new Date().toISOString() },
    { id: 6, name: 'Trà Jasmine Blossom Ủ Thạch Hữu Cơ', description: 'Trà nhài đồi cao ngâm hoa nhài tươi kết hợp thạch giòn giải nhiệt.', price: 62000, productType: 'TEA', categoryId: 2, categoryName: 'Trà Ủ Lạnh', stockQuantity: 40, taste: 'Thanh nhẹ dịu mát', temperatureType: 'COLD', season: 'SUMMER', imageUrl: '/images/products/sakura_tea.png', active: true, hotScore: 85, bestSellerScore: 84, createdAt: new Date().toISOString() },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        const list = (productsData as any).content ?? productsData;
        if (Array.isArray(list) && list.length > 0) {
          setProducts(list);
        } else {
          setProducts(fallbackCatalog);
        }
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch (error) {
        setProducts(fallbackCatalog);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products
    .filter(p => activeTab === 'ALL' || p.productType === activeTab)
    .filter(p => !activeCategory || p.categoryId === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.id - a.id;
    });

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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    onClick={() => setActiveCategory(null)}
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
                      onClick={() => setActiveCategory(category.id)}
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
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field text-xs font-semibold"
              >
                <option value="newest">Mới nhất 2026</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>

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
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product) => (
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
                }}
                className="btn-primary text-xs px-6 py-2.5"
              >
                Xóa Bộ Lọc Tìm Kiếm
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;
