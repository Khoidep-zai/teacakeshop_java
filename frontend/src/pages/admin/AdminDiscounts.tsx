import { useEffect, useState } from 'react';
import { Edit, Plus, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { createDiscount, deleteDiscount, getAdminDiscounts, updateDiscount } from '../../api/discounts';
import { getAdminCategories } from '../../api/categories';
import { getAdminProducts } from '../../api/products';
import { getAdminCombos } from '../../api/combos';
import type { Category, Combo, Discount, DiscountScope, Product } from '../../types';

const emptyDiscount = (): Partial<Discount> => ({
  code: '', name: '', description: '', discountType: 'PERCENTAGE',
  discountValue: 10, discountScope: 'STORE', priority: 0, active: true,
  startAt: new Date().toISOString().slice(0, 16),
  endAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
});

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [editing, setEditing] = useState<Partial<Discount> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [discountPage, categoryList, productPage, comboPage] = await Promise.all([
        getAdminDiscounts({ page: 0, size: 100 }), getAdminCategories(),
        getAdminProducts({ page: 0, size: 100 }), getAdminCombos({ page: 0, size: 100 }),
      ]);
      setDiscounts(discountPage.content);
      setCategories(categoryList);
      setProducts(productPage.content);
      setCombos(comboPage.content);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tải chương trình khuyến mãi');
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        ...editing,
        startAt: editing.startAt,
        endAt: editing.endAt,
        categoryId: editing.discountScope === 'CATEGORY' ? editing.categoryId : null,
        productId: editing.discountScope === 'PRODUCT' ? editing.productId : null,
        comboId: editing.discountScope === 'COMBO' ? editing.comboId : null,
      };
      if (editing.id) await updateDiscount(editing.id, payload);
      else await createDiscount(payload);
      toast.success('Đã lưu chương trình khuyến mãi');
      setEditing(null);
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể lưu chương trình');
    }
  };

  const deactivate = async (discount: Discount) => {
    if (!window.confirm(`Tắt chương trình "${discount.name}"?`)) return;
    try {
      await deleteDiscount(discount.id);
      toast.success('Đã tắt chương trình');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tắt chương trình');
    }
  };

  const setScope = (scope: DiscountScope) => setEditing(current => current ? {
    ...current, discountScope: scope, categoryId: undefined, productId: undefined, comboId: undefined,
  } : current);

  return <div className="space-y-6 max-w-7xl mx-auto">
    <header className="glass-card p-6 flex justify-between items-center">
      <div><p className="text-xs font-bold text-primary uppercase">Giá do backend quyết định</p>
        <h1 className="text-3xl font-extrabold">Quản lý khuyến mãi</h1></div>
      <button className="btn-primary" onClick={() => setEditing(emptyDiscount())}><Plus size={16} /> Tạo chương trình</button>
    </header>
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-sm"><thead><tr className="border-b text-left">
        <th className="p-4">Mã / Chương trình</th><th>Loại</th><th>Phạm vi</th>
        <th>Hiệu lực</th><th>Trạng thái</th><th className="text-right pr-4">Thao tác</th>
      </tr></thead><tbody>
        {discounts.map(discount => <tr key={discount.id} className="border-b last:border-0">
          <td className="p-4"><b>{discount.code}</b><div>{discount.name}</div></td>
          <td>{discount.discountType === 'PERCENTAGE' ? `${discount.discountValue}%` : `${discount.discountValue.toLocaleString('vi-VN')}₫`}</td>
          <td>{discount.discountScope}</td>
          <td>{new Date(discount.startAt).toLocaleString('vi-VN')}<br />→ {new Date(discount.endAt).toLocaleString('vi-VN')}</td>
          <td>{discount.currentlyEffective ? 'Đang áp dụng' : discount.active ? 'Chưa/đã hết hạn' : 'Đã tắt'}</td>
          <td className="text-right pr-4"><button className="p-2" onClick={() => setEditing({
            ...discount, startAt: discount.startAt.slice(0, 16), endAt: discount.endAt.slice(0, 16),
          })}><Edit size={16} /></button>
            {discount.active && <button className="p-2 text-red-600" onClick={() => void deactivate(discount)}><Power size={16} /></button>}</td>
        </tr>)}
        {!loading && !discounts.length && <tr><td colSpan={6} className="p-10 text-center">Chưa có chương trình</td></tr>}
      </tbody></table>
    </div>

    {editing && <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
      <form onSubmit={save} className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-extrabold">{editing.id ? 'Chỉnh sửa' : 'Tạo'} chương trình</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-xs font-bold">Mã *<input required className="input-field mt-1" value={editing.code || ''}
            onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></label>
          <label className="text-xs font-bold">Tên *<input required className="input-field mt-1" value={editing.name || ''}
            onChange={e => setEditing({ ...editing, name: e.target.value })} /></label>
        </div>
        <label className="text-xs font-bold">Mô tả<textarea className="input-field mt-1" value={editing.description || ''}
          onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="text-xs font-bold">Loại<select className="input-field mt-1" value={editing.discountType}
            onChange={e => setEditing({ ...editing, discountType: e.target.value as any })}>
            <option value="PERCENTAGE">Phần trăm</option><option value="FIXED_AMOUNT">Số tiền</option></select></label>
          <label className="text-xs font-bold">Giá trị *<input required type="number" min="0.01" step="0.01" className="input-field mt-1"
            value={editing.discountValue ?? ''} onChange={e => setEditing({ ...editing, discountValue: Number(e.target.value) })} /></label>
          <label className="text-xs font-bold">Giảm tối đa<input type="number" min="0.01" className="input-field mt-1"
            value={editing.maximumDiscountAmount ?? ''} onChange={e => setEditing({ ...editing, maximumDiscountAmount: e.target.value ? Number(e.target.value) : undefined })} /></label>
        </div>
        <label className="text-xs font-bold">Phạm vi<select className="input-field mt-1" value={editing.discountScope}
          onChange={e => setScope(e.target.value as DiscountScope)}>
          <option value="STORE">Toàn cửa hàng</option><option value="CATEGORY">Danh mục</option>
          <option value="PRODUCT">Sản phẩm</option><option value="COMBO">Combo</option></select></label>
        {editing.discountScope === 'CATEGORY' && <select required className="input-field" value={editing.categoryId || ''}
          onChange={e => setEditing({ ...editing, categoryId: Number(e.target.value) })}><option value="">Chọn danh mục</option>
          {categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
        {editing.discountScope === 'PRODUCT' && <select required className="input-field" value={editing.productId || ''}
          onChange={e => setEditing({ ...editing, productId: Number(e.target.value) })}><option value="">Chọn sản phẩm</option>
          {products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
        {editing.discountScope === 'COMBO' && <select required className="input-field" value={editing.comboId || ''}
          onChange={e => setEditing({ ...editing, comboId: Number(e.target.value) })}><option value="">Chọn combo</option>
          {combos.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-xs font-bold">Bắt đầu *<input required type="datetime-local" className="input-field mt-1"
            value={editing.startAt || ''} onChange={e => setEditing({ ...editing, startAt: e.target.value })} /></label>
          <label className="text-xs font-bold">Kết thúc *<input required type="datetime-local" className="input-field mt-1"
            min={editing.startAt} value={editing.endAt || ''} onChange={e => setEditing({ ...editing, endAt: e.target.value })} /></label>
        </div>
        <label className="flex gap-2 font-bold"><input type="checkbox" checked={editing.active ?? true}
          onChange={e => setEditing({ ...editing, active: e.target.checked })} /> Đang bật</label>
        <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Hủy</button>
          <button className="btn-primary">Lưu</button></div>
      </form>
    </div>}
  </div>;
}
