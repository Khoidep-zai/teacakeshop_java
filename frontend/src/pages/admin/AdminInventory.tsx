import { useEffect, useState } from 'react';
import { Boxes, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminProducts } from '../../api/products';
import { adjustInventory, getInventoryAdjustments } from '../../api/inventory';
import type { InventoryAdjustment, Product } from '../../types';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<InventoryAdjustment[]>([]);

  const load = async () => {
    try {
      const [productPage, adjustmentPage] = await Promise.all([
        getAdminProducts({ page: 0, size: 100 }),
        getInventoryAdjustments(0, 20),
      ]);
      setProducts(productPage.content);
      setDrafts(Object.fromEntries(productPage.content.map(item => [item.id, item.stockQuantity])));
      setHistory(adjustmentPage.content || []);
    }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể tải tồn kho'); }
  };
  useEffect(() => { void load(); }, []);

  const saveStock = async (product: Product, stockQuantity: number) => {
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      toast.error('Số lượng tồn phải là số nguyên không âm');
      return;
    }
    const note = window.prompt(`Lý do điều chỉnh tồn kho "${product.name}"`);
    if (!note?.trim()) {
      setDrafts(current => ({ ...current, [product.id]: product.stockQuantity }));
      return;
    }
    try {
      await adjustInventory(product.id, stockQuantity, note);
      toast.success(`Đã cập nhật tồn kho ${product.name}`);
      await load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể cập nhật tồn kho'); }
  };

  const filtered = products.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .filter(item => !onlyLow || item.stockQuantity <= 10);

  return <div className="space-y-6 max-w-7xl mx-auto">
    <header className="glass-card p-6"><p className="text-xs font-bold uppercase text-primary">Kho được backend quản lý</p>
      <h1 className="text-3xl font-extrabold flex items-center gap-3"><Boxes /> Theo dõi tồn kho</h1></header>
    <div className="glass-card p-4 flex gap-4"><div className="relative flex-1">
      <Search className="absolute left-3 top-3.5 w-4" /><input className="input-field pl-10" value={search}
        onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm" /></div>
      <label className="font-bold flex gap-2 items-center"><input type="checkbox" checked={onlyLow}
        onChange={e => setOnlyLow(e.target.checked)} /> Chỉ sắp hết/hết hàng</label></div>
    <div className="glass-card overflow-x-auto"><table className="w-full text-sm"><thead>
      <tr className="border-b text-left"><th className="p-4">Sản phẩm</th><th>Danh mục</th><th>Đã bán</th>
        <th>Tồn hiện tại</th><th>Cập nhật tồn</th></tr></thead><tbody>
      {filtered.map(item => <tr key={item.id} className="border-b last:border-0">
        <td className="p-4 font-bold">{item.name}</td><td>{item.categoryName}</td><td>{item.soldQuantity || 0}</td>
        <td className={item.stockQuantity === 0 ? 'text-red-600 font-bold' : item.stockQuantity <= 10 ? 'text-amber-600 font-bold' : ''}>
          {item.stockQuantity === 0 ? 'Hết hàng' : item.stockQuantity}</td>
        <td><div className="flex gap-2"><input type="number" min={0} value={drafts[item.id] ?? item.stockQuantity} className="input-field w-28"
          onChange={e => setDrafts(current => ({ ...current, [item.id]: Number(e.target.value) }))} />
          <button className="btn-primary text-xs" disabled={(drafts[item.id] ?? item.stockQuantity) === item.stockQuantity}
            onClick={() => void saveStock(item, drafts[item.id] ?? item.stockQuantity)}>Lưu</button></div></td>
      </tr>)}</tbody></table></div>
    <section className="glass-card overflow-x-auto">
      <h2 className="font-extrabold text-lg p-4 border-b">20 điều chỉnh gần nhất</h2>
      <table className="w-full text-sm"><thead><tr className="text-left border-b">
        <th className="p-4">Thời gian</th><th>Sản phẩm</th><th>Thay đổi</th><th>Lý do</th><th>Người thực hiện</th>
      </tr></thead><tbody>{history.map(item => <tr key={item.id} className="border-b last:border-0">
        <td className="p-4">{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
        <td className="font-bold">{item.productName}</td>
        <td>{item.previousQuantity} → {item.newQuantity} ({item.quantityChange > 0 ? '+' : ''}{item.quantityChange})</td>
        <td>{item.note}</td><td>{item.adjustedBy}</td>
      </tr>)}
      {!history.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có lịch sử điều chỉnh</td></tr>}
      </tbody></table>
    </section>
  </div>;
}
