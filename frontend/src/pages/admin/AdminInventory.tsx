import { useEffect, useState } from 'react';
import { Boxes, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminProducts, updateProduct } from '../../api/products';
import type { Product } from '../../types';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);

  const load = async () => {
    try { setProducts((await getAdminProducts({ page: 0, size: 100 })).content); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể tải tồn kho'); }
  };
  useEffect(() => { void load(); }, []);

  const saveStock = async (product: Product, stockQuantity: number) => {
    if (stockQuantity < 0) return;
    try {
      await updateProduct(product.id, {
        categoryId: product.categoryId, name: product.name, description: product.description,
        price: product.price, imageUrl: product.imageUrl, productType: product.productType,
        taste: product.taste, temperatureType: product.temperatureType, season: product.season,
        stockQuantity, hot: product.hot, bestSeller: product.bestSeller, active: product.active,
      });
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
        <td><input type="number" min={0} defaultValue={item.stockQuantity} className="input-field w-28"
          onBlur={e => { const value = Number(e.target.value); if (value !== item.stockQuantity) void saveStock(item, value); }} /></td>
      </tr>)}</tbody></table></div>
  </div>;
}
