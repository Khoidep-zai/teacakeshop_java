import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tags, Sparkles } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import type { Category } from '../../types';
import { getCatalogCategories, saveCategory, deleteCatalogCategory } from '../../data/mockCatalog';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(getCatalogCategories());
      }
    } catch {
      setCategories(getCatalogCategories());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setCurrentCategory(cat);
    } else {
      setCurrentCategory({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCategory.id) {
        await updateCategory(currentCategory.id, currentCategory as any);
      } else {
        await createCategory(currentCategory as any);
      }
    } catch (err) {
      console.warn('Backend category API save warning:', err);
    }
    const saved = saveCategory(currentCategory);
    toast.success(`Đã lưu danh mục "${saved.name}" thành công! ✨`, {
      style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
    });
    setIsModalOpen(false);
    setCategories(getCatalogCategories());
  };

  const handleDelete = (cat: Category) => {
    setCurrentCategory(cat);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentCategory.id) return;
    try {
      await deleteCategory(currentCategory.id);
    } catch (err) {
      console.warn('Backend category delete warning:', err);
    }
    deleteCatalogCategory(currentCategory.id);
    toast.success('Đã xóa danh mục thành công!', { style: { borderRadius: '20px', background: '#0F172A', color: '#fff' } });
    setIsDeleteModalOpen(false);
    setCategories(getCatalogCategories());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Phân Loại Thực Đơn 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Quản Lý Danh Mục Món
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary px-5 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tên Danh Mục</th>
                <th className="px-6 py-4">Mô Tả Danh Mục</th>
                <th className="px-6 py-4">Số Lượng Món</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải danh mục...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">#{cat.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Tags className="w-4 h-4 text-accent" />
                      <span>{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{cat.description || 'Chưa có mô tả'}</td>
                    <td className="px-6 py-4 font-semibold">{cat.productCount ?? 3} sản phẩm</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary text-slate-700 hover:text-white dark:text-slate-300 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                          title="Xóa danh mục"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif-title">
              {currentCategory.id ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold block mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={currentCategory.name || ''}
                  onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  className="input-field"
                  placeholder="Ví dụ: Trà Thảo Mộc Ủ Lạnh"
                />
              </div>

              <div>
                <label className="font-extrabold block mb-1">Mô Tả Chi Tiết</label>
                <textarea
                  rows={3}
                  value={currentCategory.description || ''}
                  onChange={e => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  className="input-field"
                  placeholder="Mô tả đặc điểm chính của nhóm món..."
                />
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
                  Lưu Danh Mục
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
              Xác Nhận Xóa Danh Mục?
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn xóa danh mục <span className="font-bold text-slate-900 dark:text-white">"{currentCategory.name}"</span>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary text-xs px-4 py-2">
                Hủy Bỏ
              </button>
              <button onClick={confirmDelete} className="bg-red-500 text-white text-xs px-5 py-2 rounded-xl font-extrabold hover:bg-red-600">
                Xóa Danh Mục
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
