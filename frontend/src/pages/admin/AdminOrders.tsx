import { useState, useEffect } from 'react';
import { ShoppingCart, Search, CheckCircle2, Package, XCircle, Clock, Sparkles } from 'lucide-react';
import { getAdminOrder, getAdminOrders, updateOrderStatus as updateApiOrderStatus } from '../../api/orders';
import type { Order, Page } from '../../types';
import toast from 'react-hot-toast';

// Helper: lấy itemName an toàn từ OrderItem
const getItemName = (item: any): string => item.itemName || item.name || 'Sản phẩm';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // FIXED: Dùng đúng enum backend (PREPARING thay vì SHIPPING)
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [detail, setDetail] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const pageData = await getAdminOrders({ page: 0, size: 100 }) as Page<Order>;
      setOrders(pageData?.content ?? []);
    } catch (err: any) {
      setOrders([]);
      toast.error(err?.response?.data?.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (ord: Order, newStatus: Order['status']) => {
    try {
      await updateApiOrderStatus(ord.id, newStatus);
      toast.success(`Đã cập nhật trạng thái → "${newStatus}" ✨`, {
        style: { borderRadius: '20px', background: '#0F172A', color: '#fff' },
      });
      await fetchOrders();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái';
      toast.error(msg);
    }
  };

  // FIXED: Dùng đúng status backend (PREPARING thay vì SHIPPING)
  const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'];

  const filtered = orders
    .filter(o => statusFilter === 'ALL' || o.status === statusFilter)
    .filter(o => typeFilter === 'ALL' || o.orderType === typeFilter)
    .filter(o =>
      o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(searchTerm))
    );

  const openDetail = async (id: number) => {
    try { setDetail(await getAdminOrder(id)); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể tải chi tiết đơn'); }
  };

  const nextStatuses = (current: Order['status']): Order['status'][] => ({
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [], CANCELLED: [],
  }[current] as Order['status'][]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock size={12} /> Chờ xử lý</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20"><CheckCircle2 size={12} /> Đã xác nhận</span>;
      case 'PREPARING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20"><Package size={12} /> Đang chế tác</span>;
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
            <span>Quản Lý Đơn Hàng Thưởng Trà 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Danh Sách Đơn Hàng ({orders.length})
          </h1>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-xs px-4 py-2">
          🔄 Làm mới
        </button>
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

        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <select className="input-field w-48" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="ALL">Mọi loại đơn</option><option value="NORMAL">Giao hàng</option>
            <option value="TAKEAWAY_PREORDER">Đặt trước</option><option value="RESERVATION_COMBO">Combo đặt bàn</option>
          </select>
          {STATUS_FILTERS.map((st) => (
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
                <th className="px-6 py-4 text-center">Cập Nhật</th>
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
                  <tr key={`${ord.id}-${ord.orderCode}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary flex items-center gap-1.5">
                      <ShoppingCart size={14} />
                      <button onClick={() => void openDetail(ord.id)} className="underline">#{ord.orderCode}</button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{ord.customerName || 'Khách Hàng'}</p>
                      <p className="text-[11px] text-slate-400">{ord.customerPhone || '---'}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs font-semibold">
                      {ord.items && ord.items.length > 0
                        ? ord.items.map(i => `${getItemName(i)} (x${i.quantity})`).join(', ')
                        : 'Đơn hàng trà bánh'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary dark:text-primary-glow">
                      {(ord.finalAmount ?? ord.totalAmount).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4">{getStatusBadge(ord.status)}</td>
                    <td className="px-6 py-4">
                      {/* FIXED: Dùng đúng enum backend (PREPARING thay vì SHIPPING) */}
                      <select
                        value=""
                        onChange={(e) => handleStatusChange(ord, e.target.value as Order['status'])}
                        disabled={!nextStatuses(ord.status).length}
                        className="input-field text-xs font-extrabold py-1 px-2.5"
                      >
                        <option value="">Chọn bước tiếp theo</option>
                        {nextStatuses(ord.status).map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
        <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
          <h2 className="text-xl font-extrabold">Chi tiết đơn #{detail.orderCode}</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <p><b>Khách:</b> {detail.customerName}<br />{detail.customerPhone}<br />{detail.customerEmail}</p>
            <p><b>Loại:</b> {detail.orderType}<br /><b>Trạng thái:</b> {detail.status}</p>
            <p><b>Địa chỉ:</b> {detail.shippingAddress || '—'}<br /><b>Nhận hàng:</b> {detail.pickupTime ? new Date(detail.pickupTime).toLocaleString('vi-VN') : '—'}</p>
            <p><b>Tổng:</b> {detail.totalAmount.toLocaleString('vi-VN')}₫<br />
              <b>Cọc:</b> {(detail.depositAmount || 0).toLocaleString('vi-VN')}₫<br />
              <b>Còn lại:</b> {(detail.remainingAmount || 0).toLocaleString('vi-VN')}₫</p>
          </div>
          <table className="w-full text-sm"><tbody>{detail.items?.map(item => <tr key={item.id} className="border-b">
            <td className="py-2">{item.itemName}</td><td>x{item.quantity}</td>
            <td>{item.originalUnitPrice?.toLocaleString('vi-VN')}₫</td><td>-{item.discountAmount?.toLocaleString('vi-VN')}₫</td>
            <td className="text-right">{item.lineTotal.toLocaleString('vi-VN')}₫</td></tr>)}</tbody></table>
          <p><b>Ghi chú:</b> {detail.note || '—'}</p>
          <button className="btn-secondary float-right" onClick={() => setDetail(null)}>Đóng</button>
        </div>
      </div>}

    </div>
  );
}
