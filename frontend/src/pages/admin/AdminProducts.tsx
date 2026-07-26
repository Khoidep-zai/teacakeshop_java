import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import type { Product } from '../../types';
import { getCatalogProducts, saveProduct, deleteCatalogProduct } from '../../data/mockCatalog';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const list = (data as any).content || data;
      if (Array.isArray(list) && list.length > 0) {
        setProducts(list);
      } else {
        setProducts(getCatalogProducts());
      }
    } catch {
      setProducts(getCatalogProducts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleUpdate = () => setProducts(getCatalogProducts());
    window.addEventListener('catalog_updated', handleUpdate);
    return () => window.removeEventListener('catalog_updated', handleUpdate);
  }, []);

  const handleOpenModal = (prod?: Product) => {
    if (prod) {
      setCurrentProduct(prod);
    } else {
      setCurrentProduct({
        name: '',
        description: '',
        price: 75000,
        productType: 'CAKE',
        categoryId: 1,
        categoryName: 'Bánh ngọt Pháp',
        stockQuantity: 20,
        taste: 'Thơm ngon',
        temperatureType: 'BOTH',
        imageUrl: '/images/products/matcha_cake.png',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProduct.id) {
        await updateProduct(currentProduct.id, currentProduct as any);
      } else {
        await createProduct(currentProduct as any);
      }
    } catch (err) {
      console.warn('Backend product API save warning, saving locally:', err);
    }
    // Synchronize to mockCatalog & Storefront
    const saved = saveProduct(currentProduct);
    toast.success(`Đã lưu sản phẩm "${saved.name}" và đồng bộ lên cửa hàng! ✨`, {
      style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
    });
    setIsModalOpen(false);
    setProducts(getCatalogProducts());
  };

  const handleDelete = (prod: Product) => {
    setCurrentProduct(prod);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentProduct.id) return;
    try {
      await deleteProduct(currentProduct.id);
    } catch (err) {
      console.warn('Backend product delete warning:', err);
    }
    deleteCatalogProduct(currentProduct.id);
    toast.success('Đã xóa sản phẩm thành công!', { style: { borderRadius: '20px', background: '#0F172A', color: '#fff' } });
    setIsDeleteModalOpen(false);
    setProducts(getCatalogProducts());
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Quản Lý Sản Phẩm Đồng Bộ 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Danh Mục Trà & Bánh Thủ Công
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary px-5 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Hình Ảnh</th>
                <th className="px-6 py-4">Tên Sản Phẩm</th>
                <th className="px-6 py-4">Loại Món</th>
                <th className="px-6 py-4">Danh Mục</th>
                <th className="px-6 py-4">Giá Niêm Yết</th>
                <th className="px-6 py-4">Tồn Kho</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải dữ liệu sản phẩm...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-semibold">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3">
                      <img
                        src={prod.imageUrl || '/images/products/matcha_cake.png'}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">
                      {prod.name}
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      {prod.productType === 'TEA' ? '🍵 Trà Thuần' : '🍰 Bánh Thủ Công'}
                    </td>
                    <td className="px-6 py-3">{prod.categoryName || 'Bánh Pháp'}</td>
                    <td className="px-6 py-3 font-extrabold text-primary dark:text-primary-glow">
                      {prod.price.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-3 font-semibold">{prod.stockQuantity} phần</td>
                    <td className="px-6 py-3">
                      {prod.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Đang bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                          <XCircle size={12} /> Tạm ngưng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(prod)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary text-slate-700 hover:text-white dark:text-slate-300 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                          title="Xóa món"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif-title">
              {currentProduct.id ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold block mb-1">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  value={currentProduct.name || ''}
                  onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="input-field"
                  placeholder="Ví dụ: Bánh Mousse Chocolate Dâu Tây 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold block mb-1">Loại Món *</label>
                  <select
                    value={currentProduct.productType || 'CAKE'}
                    onChange={e => setCurrentProduct({ ...currentProduct, productType: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="CAKE">Bánh Thủ Công</option>
                    <option value="TEA">Trà Ủ Lạnh</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold block mb-1">Giá Niêm Yết (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={currentProduct.price || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold block mb-1">Mô Tả Sản Phẩm</label>
                <textarea
                  rows={3}
                  value={currentProduct.description || ''}
                  onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  className="input-field"
                  placeholder="Nhập mô tả nguyên liệu, hương vị..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold block mb-1">Đường Dẫn Hình Ảnh (URL)</label>
                  <input
                    type="text"
                    value={currentProduct.imageUrl || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="/images/products/matcha_cake.png"
                  />
                </div>

                <div>
                  <label className="font-extrabold block mb-1">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    min={0}
                    value={currentProduct.stockQuantity || 20}
                    onChange={e => setCurrentProduct({ ...currentProduct, stockQuantity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prodActive"
                  checked={currentProduct.active ?? true}
                  onChange={e => setCurrentProduct({ ...currentProduct, active: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <label htmlFor="prodActive" className="font-bold cursor-pointer">
                  Mở bán trực tiếp trên trang chủ & thực đơn
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2.5"
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-primary text-xs px-5 py-2.5 font-extrabold">
                  Lưu & Đồng Bộ Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm p-6 text-center space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-serif-title">
              Xác Nhận Xóa Sản Phẩm?
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold text-slate-900 dark:text-white">"{currentProduct.name}"</span>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary text-xs px-4 py-2">
                Hủy Bỏ
              </button>
              <button onClick={confirmDelete} className="bg-red-500 text-white text-xs px-5 py-2 rounded-xl font-extrabold hover:bg-red-600">
                Xóa Sản Phẩm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
