import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Thermometer, ChevronLeft, Loader2, ArrowLeft } from 'lucide-react';
import { getProduct, getProductSuggestions } from '../api/products';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/products/ProductCard';
import type { Product, ProductSuggestion } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      const numId = Number(id);
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const productData = await getProduct(numId);
        setProduct(productData);

        const suggestionsData = await getProductSuggestions(numId);
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addItem('PRODUCT', product.id, quantity);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('products.no_products', 'Không tìm thấy sản phẩm')}
        </h2>
        <button 
          onClick={() => navigate('/products')}
          className="flex items-center text-primary font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('nav.products', 'Về danh sách sản phẩm')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-24 pb-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t('common.close', 'Quay lại')}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-96 md:h-full min-h-[400px] bg-gray-100 dark:bg-gray-700">
              <img 
                src={product.imageUrl || '/favicon.svg'} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  {product.categoryName}
                </span>
                {product.productType && (
                  <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {product.productType}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                  {product.taste ? `Vị: ${product.taste}` : product.productType}
                </span>
                {product.temperatureType && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <Thermometer className="w-4 h-4 mr-1" />
                    {product.temperatureType === 'BOTH' ? 'Nóng & Lạnh' : product.temperatureType === 'HOT' ? 'Nóng' : 'Lạnh'}
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    {t('cart.quantity', 'Số lượng')}
                  </h3>
                  <div className="flex items-center w-32 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="flex-1 text-center font-semibold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stockQuantity <= 0}
                  className="flex-1 bg-primary hover:bg-opacity-90 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {adding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
                  {product.stockQuantity <= 0 ? t('products.out_of_stock', 'Hết hàng') : t('products.add_to_cart', 'Thêm vào giỏ')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Pairings */}
        {suggestions.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('products.suggestions', 'Món gợi ý đi kèm')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={item.suggestedProduct} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
