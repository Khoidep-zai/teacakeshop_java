import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Sparkles, CheckCircle2, XCircle, Tag } from 'lucide-react';
import { getAdminDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../api/discounts';
import { getCatalogDiscounts, saveDiscount, deleteCatalogDiscount, type DiscountItem } from '../../data/mockCatalog';
import toast from 'react-hot-toast';

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Partial<DiscountItem>>({});

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const data = await getAdminDiscounts();
      const list = (data as any).content || data;
      if (Array.isArray(list) && list.length > 0) {
        setDiscounts(list);
      } else {
        setDiscounts(getCatalogDiscounts());
      }
    } catch {
      setDiscounts(getCatalogDiscounts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleOpenModal = (disc?: DiscountItem) => {
    if (disc) {
      setCurrentDiscount(disc);
    } else {
      setCurrentDiscount({
        code: `LOUNGE${Math.floor(100 + Math.random() * 900)}`,
        name: 'Voucher Ưu Đãi Mới 2026',
        discountType: 'PERCENTAGE',
        value: 15,
        scope: 'ALL_PRODUCTS',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentDiscount.id) {
        await updateDiscount(currentDiscount.id, currentDiscount as any);
      } else {
        await createDiscount(currentDiscount as any);
      }
    } catch (err) {
      console.warn('Backend discount API save warning:', err);
    }
    const saved = saveDiscount(currentDiscount);
    toast.success(`Đã lưu Mã Khuyến Mãi "${saved.code}" thành công! ✨`, {
      style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
    });
    setIsModalOpen(false);
    setDiscounts(getCatalogDiscounts());
  };

  const handleDelete = (disc: DiscountItem) => {
    setCurrentDiscount(disc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentDiscount.id) return;
    try {
      await deleteDiscount(currentDiscount.id);
    } catch (err) {
      console.warn('Backend discount delete warning:', err);
    }
    deleteCatalogDiscount(currentDiscount.id);
    toast.success('Đã xóa Mã Khuyến Mãi!', { style: { borderRadius: '20px', background: '#0F172A', color: '#fff' } });
    setIsDeleteModalOpen(false);
    setDiscounts(getCatalogDiscounts());
  };

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Quản Lý Voucher & Mã Giảm Giá 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Chương Trình Khuyến Mãi Thành Viên
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary px-5 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Khuyến Mãi Mới</span>
        </button>
      </div>

      {/* Discounts Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Mã Voucher</th>
                <th className="px-6 py-4">Tên Chương Trình</th>
                <th className="px-6 py-4">Loại Giảm Gia</th>
                <th className="px-6 py-4">Mức Giảm</th>
                <th className="px-6 py-4">Phạm Vi Áp Dụng</th>
                <th className="px-6 py-4">Ngày Bắt Đầu</th>
                <th className="px-6 py-4">Ngày Hết Hạn</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải danh sách khuyến mãi...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có mã khuyến mãi nào.
                  </td>
                </tr>
              ) : (
                discounts.map((disc) => (
                  <tr key={disc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-extrabold text-accent flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{disc.code}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{disc.name}</td>
                    <td className="px-6 py-4 font-semibold">
                      {disc.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định (VNĐ)'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary dark:text-primary-glow">
                      {disc.discountType === 'PERCENTAGE' ? `${disc.value}%` : `${disc.value.toLocaleString('vi-VN')}₫`}
                    </td>
                    <td className="px-6 py-4 font-semibold">{disc.scope || 'Tất cả sản phẩm'}</td>
                    <td className="px-6 py-4">{formatDateString(disc.startDate)}</td>
                    <td className="px-6 py-4">{formatDateString(disc.endDate)}</td>
                    <td className="px-6 py-4">
                      {disc.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Khả dụng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                          <XCircle size={12} /> Hết hạn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(disc)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary text-slate-700 hover:text-white dark:text-slate-300 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(disc)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                          title="Xóa voucher"
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

      {/* Add / Edit Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif-title">
              {currentDiscount.id ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold block mb-1">Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    required
                    value={currentDiscount.code || ''}
                    onChange={e => setCurrentDiscount({ ...currentDiscount, code: e.target.value.toUpperCase() })}
                    className="input-field uppercase font-mono font-bold"
                    placeholder="WELCOME2026"
                  />
                </div>

                <div>
                  <label className="font-extrabold block mb-1">Loại Ưu Đãi *</label>
                  <select
                    value={currentDiscount.discountType || 'PERCENTAGE'}
                    onChange={e => setCurrentDiscount({ ...currentDiscount, discountType: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="PERCENTAGE">Phần Trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số Tiền Trực Tiếp (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold block mb-1">Tên Chương Trình *</label>
                <input
                  type="text"
                  required
                  value={currentDiscount.name || ''}
                  onChange={e => setCurrentDiscount({ ...currentDiscount, name: e.target.value })}
                  className="input-field"
                  placeholder="Ví dụ: Ưu đãi chào mừng thành viên mới"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold block mb-1">
                    Giá Trị Giảm ({currentDiscount.discountType === 'PERCENTAGE' ? '%' : 'VNĐ'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={currentDiscount.discountType === 'PERCENTAGE' ? 100 : undefined}
                    value={currentDiscount.value || ''}
                    onChange={e => setCurrentDiscount({ ...currentDiscount, value: Number(e.target.value) })}
                    className="input-field font-bold"
                  />
                </div>

                <div>
                  <label className="font-extrabold block mb-1">Phạm Vi Áp Dụng</label>
                  <select
                    value={currentDiscount.scope || 'ALL_PRODUCTS'}
                    onChange={e => setCurrentDiscount({ ...currentDiscount, scope: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="ALL_PRODUCTS">Tất Cả Sản Phẩm</option>
                    <option value="SPECIFIC_CATEGORY">Theo Danh Mục</option>
                    <option value="SPECIFIC_PRODUCT">Theo Sản Phẩm</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="discActive"
                  checked={currentDiscount.isActive ?? true}
                  onChange={e => setCurrentDiscount({ ...currentDiscount, isActive: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <label htmlFor="discActive" className="font-bold cursor-pointer">
                  Kích hoạt mã khuyến mãi ngay lập tức
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
                  Lưu Mã Khuyến Mãi
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
              Xác Nhận Xóa Voucher?
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn xóa mã <span className="font-bold text-slate-900 dark:text-white">"{currentDiscount.code}"</span>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary text-xs px-4 py-2">
                Hủy Bỏ
              </button>
              <button onClick={confirmDelete} className="bg-red-500 text-white text-xs px-5 py-2 rounded-xl font-extrabold hover:bg-red-600">
                Xóa Voucher
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
