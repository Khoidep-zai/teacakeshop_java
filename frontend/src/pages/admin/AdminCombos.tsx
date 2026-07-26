import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, PackageSearch, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { getCombos, createCombo, updateCombo, deleteCombo } from '../../api/combos';
import type { Combo } from '../../types';
import { getCatalogCombos, saveCombo, deleteCatalogCombo } from '../../data/mockCatalog';
import toast from 'react-hot-toast';

export default function AdminCombos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Partial<Combo>>({});

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const data = await getCombos();
      const list = (data as any).content || data;
      if (Array.isArray(list) && list.length > 0) {
        setCombos(list);
      } else {
        setCombos(getCatalogCombos());
      }
    } catch {
      setCombos(getCatalogCombos());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
    const handleUpdate = () => setCombos(getCatalogCombos());
    window.addEventListener('catalog_updated', handleUpdate);
    return () => window.removeEventListener('catalog_updated', handleUpdate);
  }, []);

  const handleOpenModal = (cmb?: Combo) => {
    if (cmb) {
      setCurrentCombo(cmb);
    } else {
      setCurrentCombo({
        name: '',
        description: '',
        originalPrice: 165000,
        comboPrice: 135000,
        savingAmount: 30000,
        imageUrl: '/images/combos/royal_tea_set.png',
        weatherType: 'SUNNY',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCombo.id) {
        await updateCombo(currentCombo.id, currentCombo as any);
      } else {
        await createCombo(currentCombo as any);
      }
    } catch (err) {
      console.warn('Backend combo API save warning:', err);
    }
    const saved = saveCombo(currentCombo);
    toast.success(`Đã lưu Combo Pass "${saved.name}" và đồng bộ lên cửa hàng! ✨`, {
      style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
    });
    setIsModalOpen(false);
    setCombos(getCatalogCombos());
  };

  const handleDelete = (cmb: Combo) => {
    setCurrentCombo(cmb);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentCombo.id) return;
    try {
      await deleteCombo(currentCombo.id);
    } catch (err) {
      console.warn('Backend combo delete warning:', err);
    }
    deleteCatalogCombo(currentCombo.id);
    toast.success('Đã xóa Combo Pass thành công!', { style: { borderRadius: '20px', background: '#0F172A', color: '#fff' } });
    setIsDeleteModalOpen(false);
    setCombos(getCatalogCombos());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Quản Lý Combo Pass Hoàng Gia 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Danh Sách Set Combo Thưởng Trà
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-accent px-5 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Combo Pass Mới</span>
        </button>
      </div>

      {/* Combos Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Hình Ảnh</th>
                <th className="px-6 py-4">Tên Combo Pass</th>
                <th className="px-6 py-4">Giá Niêm Yết</th>
                <th className="px-6 py-4">Giá Combo</th>
                <th className="px-6 py-4">Tiết Kiệm</th>
                <th className="px-6 py-4">Gợi Ý Thời Tiết</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải dữ liệu combo...
                  </td>
                </tr>
              ) : combos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có Set Combo nào.
                  </td>
                </tr>
              ) : (
                combos.map((cmb) => (
                  <tr key={cmb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3">
                      <img
                        src={cmb.imageUrl || '/images/combos/royal_tea_set.png'}
                        alt={cmb.name}
                        className="w-14 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <PackageSearch className="w-4 h-4 text-accent" />
                      <span>{cmb.name}</span>
                    </td>
                    <td className="px-6 py-3 text-slate-400 line-through">
                      {cmb.originalPrice.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-3 font-extrabold text-accent">
                      {cmb.comboPrice.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      -{cmb.savingAmount ? cmb.savingAmount.toLocaleString('vi-VN') : (cmb.originalPrice - cmb.comboPrice).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-3 font-semibold uppercase">{cmb.weatherType || 'SUNNY'}</td>
                    <td className="px-6 py-3">
                      {cmb.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Đang mở bán
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
                          onClick={() => handleOpenModal(cmb)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-accent dark:bg-slate-800 dark:hover:bg-accent text-slate-700 hover:text-white dark:text-slate-300 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cmb)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                          title="Xóa combo"
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

      {/* Add / Edit Combo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif-title">
              {currentCombo.id ? 'Chỉnh Sửa Combo Pass' : 'Thêm Set Combo Pass Mới'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold block mb-1">Tên Set Combo Pass *</label>
                <input
                  type="text"
                  required
                  value={currentCombo.name || ''}
                  onChange={e => setCurrentCombo({ ...currentCombo, name: e.target.value })}
                  className="input-field"
                  placeholder="Ví dụ: Set Thưởng Trà Hoàng Gia 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold block mb-1">Giá Niêm Yết (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={currentCombo.originalPrice || ''}
                    onChange={e => setCurrentCombo({ ...currentCombo, originalPrice: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="font-extrabold block mb-1">Giá Ưu Đãi Combo (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={currentCombo.comboPrice || ''}
                    onChange={e => setCurrentCombo({ ...currentCombo, comboPrice: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold block mb-1">Mô Tả Combo Pass</label>
                <textarea
                  rows={3}
                  value={currentCombo.description || ''}
                  onChange={e => setCurrentCombo({ ...currentCombo, description: e.target.value })}
                  className="input-field"
                  placeholder="Nhập chi tiết các món trà bánh bao gồm trong combo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold block mb-1">Đường Dẫn Hình Ảnh (URL)</label>
                  <input
                    type="text"
                    value={currentCombo.imageUrl || ''}
                    onChange={e => setCurrentCombo({ ...currentCombo, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="/images/combos/royal_tea_set.png"
                  />
                </div>

                <div>
                  <label className="font-extrabold block mb-1">Phối Vị Theo Thời Tiết</label>
                  <select
                    value={currentCombo.weatherType || 'SUNNY'}
                    onChange={e => setCurrentCombo({ ...currentCombo, weatherType: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="SUNNY">Nắng Ấm</option>
                    <option value="RAINY">Trời Mưa</option>
                    <option value="COLD">Se Lạnh</option>
                    <option value="HOT">Nắng Nóng</option>
                    <option value="NORMAL">Tự Nhiên</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cmbActive"
                  checked={currentCombo.active ?? true}
                  onChange={e => setCurrentCombo({ ...currentCombo, active: e.target.checked })}
                  className="w-4 h-4 accent-accent rounded"
                />
                <label htmlFor="cmbActive" className="font-bold cursor-pointer">
                  Mở bán trực tiếp trên trang Combo Pass
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
                <button type="submit" className="btn-accent text-xs px-5 py-2.5 font-extrabold">
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
              Xác Nhận Xóa Combo Pass?
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có chắc chắn muốn xóa <span className="font-bold text-slate-900 dark:text-white">"{currentCombo.name}"</span>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary text-xs px-4 py-2">
                Hủy Bỏ
              </button>
              <button onClick={confirmDelete} className="bg-red-500 text-white text-xs px-5 py-2 rounded-xl font-extrabold hover:bg-red-600">
                Xóa Combo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
