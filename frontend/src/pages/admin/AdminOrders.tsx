import { useState, useEffect } from 'react';
import { ShoppingCart, Search, CheckCircle2, Truck, XCircle, Clock, Sparkles } from 'lucide-react';
import { getAdminOrders, updateOrderStatus as updateApiOrderStatus } from '../../api/orders';
import type { Order } from '../../types';
import { getUserOrders, updateOrderStatus } from '../../data/userStore';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    const storeOrders = getUserOrders();
    try {
      const data = await getAdminOrders();
      const list = (data as any).content || data;
      if (Array.isArray(list) && list.length > 0) {
        const combined = [...storeOrders];
        list.forEach(o => {
          if (!combined.some(x => x.orderCode === o.orderCode)) combined.push(o);
        });
        setOrders(combined);
      } else {
        setOrders(storeOrders);
      }
    } catch {
      setOrders(storeOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const handleUpdate = () => setOrders(getUserOrders());
    window.addEventListener('user_store_updated', handleUpdate);
    return () => window.removeEventListener('user_store_updated', handleUpdate);
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      await updateApiOrderStatus(orderId, newStatus);
    } catch (err) {
      console.warn('Backend order status update warning:', err);
    }
    updateOrderStatus(orderId, newStatus);
    toast.success(`Đã cập nhật trạng thái đơn hàng sang "${newStatus}" và đồng bộ tới Khách hàng! ✨`, {
      style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
    });
    setOrders(getUserOrders());
  };

  const filtered = orders
    .filter(o => statusFilter === 'ALL' || o.status === statusFilter)
    .filter(o =>
      o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(searchTerm))
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock size={12} /> Chờ xử lý</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20"><CheckCircle2 size={12} /> Đã xác nhận</span>;
      case 'SHIPPING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20"><Truck size={12} /> Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><CheckCircle2 size={12} /> Hoàn tất</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20"><XCircle size={12} /> Đã hủy</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Quản Lý Đơn Hàng Thưởng Trà Đồng Bộ 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Danh Sách Đơn Hàng Khách Đặt ({orders.length})
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn, tên khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-primary dark:text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Sản Phẩm Đặt</th>
                <th className="px-6 py-4">Tổng Tiền</th>
                <th className="px-6 py-4">Ngày Đặt</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Cập Nhật Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary flex items-center gap-1.5">
                      <ShoppingCart size={14} />
                      <span>#{ord.orderCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{ord.customerName || 'Khách Hàng'}</p>
                      <p className="text-[11px] text-slate-400">{ord.customerPhone || '0901234567'}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs font-semibold">
                      {ord.items && ord.items.length > 0 ? ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ') : 'Đơn hàng trà bánh'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary dark:text-primary-glow">
                      {(ord.finalAmount || ord.totalAmount).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4">{getStatusBadge(ord.status)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                        className="input-field text-xs font-extrabold py-1 px-2.5"
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="CONFIRMED">Xác nhận & Chế biến</option>
                        <option value="SHIPPING">Đang giao hàng 🚚</option>
                        <option value="COMPLETED">Hoàn tất đơn ✅</option>
                        <option value="CANCELLED">Hủy đơn</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
