import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Calendar, LogOut, ChevronRight, Sparkles, Award, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getMyOrdersPage } from '../api/orders';
import { cancelReservation, getMyReservation, getMyReservationsPage } from '../api/reservations';
import { getCustomerSummary } from '../api/auth';
import type { Order, Reservation } from '../types';
import toast from 'react-hot-toast';

// Helper: lấy itemName an toàn từ OrderItem
const getItemName = (item: any): string => item.itemName || item.name || 'Sản phẩm';

export default function Profile() {
  const { user, logout, logoutAll } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reservations'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderPage, setOrderPage] = useState(0);
  const [orderPages, setOrderPages] = useState(0);
  const [reservationPage, setReservationPage] = useState(0);
  const [reservationPages, setReservationPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);
  const [reservationDetail, setReservationDetail] = useState<Reservation | null>(null);

  const loadUserData = async () => {
    setLoading(true);

    try {
      const [orderResult, reservationResult, summary] = await Promise.all([
        getMyOrdersPage(orderPage, 10),
        getMyReservationsPage(reservationPage, 10),
        getCustomerSummary(),
      ]);
      setOrders(orderResult.content || []);
      setOrderPages(orderResult.totalPages || 0);
      setReservations(reservationResult.content || []);
      setReservationPages(reservationResult.totalPages || 0);
      setTotalOrders(summary.totalOrders ?? orderResult.totalElements ?? 0);
      setTotalReservations(summary.totalReservations ?? reservationResult.totalElements ?? 0);
    } catch (error: any) {
      setOrders([]);
      setReservations([]);
      toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [orderPage, reservationPage]);

  const openReservation = async (id: number) => {
    try {
      setReservationDetail(await getMyReservation(id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải chi tiết lịch đặt bàn.');
    }
  };

  const cancelMyReservation = async (reservation: Reservation) => {
    if (!window.confirm(`Bạn chắc chắn muốn hủy lịch ${reservation.reservationCode}?`)) return;
    try {
      await cancelReservation(reservation.reservationCode, reservation.customerPhone);
      toast.success('Đã hủy lịch đặt bàn.');
      setReservationDetail(null);
      await loadUserData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lịch đặt bàn không đủ điều kiện hủy.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 font-extrabold uppercase rounded-full border border-amber-500/20">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="text-[10px] px-2.5 py-0.5 bg-cyber-teal/10 text-cyber-teal font-extrabold uppercase rounded-full border border-cyber-teal/20">Đã xác nhận</span>;
      case 'PREPARING':
        return <span className="text-[10px] px-2.5 py-0.5 bg-sky-500/10 text-sky-500 font-extrabold uppercase rounded-full border border-sky-500/20">Đang chế tác 🍵</span>;
      case 'COMPLETED':
        return <span className="text-[10px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-extrabold uppercase rounded-full border border-emerald-500/20">Đã hoàn thành ✅</span>;
      case 'CANCELLED':
        return <span className="text-[10px] px-2.5 py-0.5 bg-red-500/10 text-red-500 font-extrabold uppercase rounded-full border border-red-500/20">Đã hủy</span>;
      default:
        return <span className="text-[10px] px-2.5 py-0.5 bg-slate-500/10 text-slate-500 font-extrabold uppercase rounded-full">{status}</span>;
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="glass-card p-5 space-y-2 h-fit border border-slate-200 dark:border-slate-800">
          <div className="p-4 text-center border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-cyber-teal text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-lg shadow-primary/20">
              {user?.fullName?.charAt(0) || 'K'}
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white font-serif-title">{user?.fullName || 'Khoi Nguyen'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email || ''}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-cyber-teal/10 text-cyber-teal text-[10px] font-black uppercase tracking-wider rounded-full border border-cyber-teal/30">
              <Sparkles size={12} /> Thành Viên Hoàng Gia 2026
            </span>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'overview' ? 'bg-slate-900 text-white dark:bg-primary dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User size={16} /> Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'orders' ? 'bg-slate-900 text-white dark:bg-primary dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package size={16} /> Đơn hàng của tôi ({totalOrders})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'reservations' ? 'bg-slate-900 text-white dark:bg-primary dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar size={16} /> Lịch hẹn đặt bàn ({totalReservations})
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs text-red-500 hover:bg-red-500/10 transition-all pt-4 border-t border-slate-200 dark:border-slate-800"
          >
            <LogOut size={16} /> Đăng xuất tài khoản
          </button>
          <button
            onClick={async () => {
              if (!window.confirm('Đăng xuất tài khoản trên tất cả thiết bị?')) return;
              try {
                await logoutAll();
              } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Không thể đăng xuất mọi thiết bị.');
              }
            }}
            className="w-full px-4 py-2 text-left rounded-xl font-bold text-[11px] text-red-400 hover:bg-red-500/10"
          >
            Đăng xuất tất cả thiết bị
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title">Thông Tin Cá Nhân</h2>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-400" /> Hạng Hoàng Gia Cyber 2026
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Họ và tên</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.fullName || '---'}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Email liên hệ</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.email || '---'}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Số điện thoại</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.phone || '---'}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Quyền hệ thống</p>
                  <p className="font-extrabold text-primary dark:text-primary-glow text-sm">{user?.role || 'CUSTOMER'}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Trạng thái tài khoản</p>
                  <p className="font-extrabold text-emerald-600 text-sm">{user?.active ? 'Đang hoạt động' : 'Đã khóa'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Lịch Sử Đơn Hàng Thưởng Trà ({totalOrders})</span>
              </h2>
              {loading ? (
                <div className="py-10 text-center text-slate-400 text-xs">Đang tải lịch sử đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">Bạn chưa có đơn hàng nào.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={`${ord.id}-${ord.orderCode}`} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">#{ord.orderCode}</span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ord.createdAt).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {ord.items && ord.items.length > 0
                            ? ord.items.map(i => `${getItemName(i)} (x${i.quantity})`).join(', ')
                            : 'Đơn hàng trà bánh'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                        <span className="font-extrabold text-base text-primary dark:text-primary-glow">
                          {(ord.finalAmount ?? ord.totalAmount).toLocaleString('vi-VN')}₫
                        </span>
                        <Link
                          to={`/orders/${ord.orderCode}${ord.customerPhone ? `?phone=${encodeURIComponent(ord.customerPhone)}` : ''}`}
                          className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1"
                        >
                          <span>Chi tiết</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && orderPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                  <button className="btn-secondary text-xs" disabled={orderPage === 0} onClick={() => setOrderPage(value => value - 1)}>Trang trước</button>
                  <span className="text-xs font-bold">{orderPage + 1}/{orderPages}</span>
                  <button className="btn-secondary text-xs" disabled={orderPage + 1 >= orderPages} onClick={() => setOrderPage(value => value + 1)}>Trang sau</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800">
                Lịch Sử Đặt Bàn Lounge ({totalReservations})
              </h2>
              {loading ? (
                <div className="py-10 text-center text-slate-400 text-xs">Đang tải lịch đặt bàn...</div>
              ) : reservations.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">Bạn chưa có lịch đặt bàn nào.</div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((res) => {
                    // BE trả reservationTime dạng ISO: "2026-07-26T15:00:00"
                    // local store có thể có reservationDate + reservationTime riêng
                    const dt = res.reservationTime ? new Date(res.reservationTime) : null;
                    const isValidDate = dt && !isNaN(dt.getTime());
                    const dateStr = isValidDate
                      ? dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : (res.reservationDate || '---');
                    const timeStr = isValidDate
                      ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : (res.reservationTime || '---');
                    const guestCount = res.numberOfPeople ?? res.partySize ?? '?';

                    return (
                    <div key={`${res.id}-${res.reservationCode}`} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-slate-900 dark:text-white">Mã Hẹn: #{res.reservationCode}</span>
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-extrabold uppercase rounded-full border border-emerald-500/20">
                            {res.status === 'CONFIRMED' ? 'Đã giữ chỗ ✅' : res.status === 'PENDING' ? 'Chờ xác nhận' : res.status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {res.note || 'Lịch hẹn thưởng trà'} — {timeStr} ngày {dateStr} ({guestCount} khách)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-xs" onClick={() => void openReservation(res.id)}>Chi tiết</button>
                        {res.status === 'PENDING' && (
                          <button className="text-xs font-bold text-red-500 px-3" onClick={() => void cancelMyReservation(res)}>Hủy lịch</button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
              {!loading && reservationPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                  <button className="btn-secondary text-xs" disabled={reservationPage === 0} onClick={() => setReservationPage(value => value - 1)}>Trang trước</button>
                  <span className="text-xs font-bold">{reservationPage + 1}/{reservationPages}</span>
                  <button className="btn-secondary text-xs" disabled={reservationPage + 1 >= reservationPages} onClick={() => setReservationPage(value => value + 1)}>Trang sau</button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
      {reservationDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">Lịch #{reservationDetail.reservationCode}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><b>Khách:</b><br />{reservationDetail.customerName}<br />{reservationDetail.customerPhone}</p>
              <p><b>Thời gian:</b><br />{new Date(reservationDetail.reservationTime).toLocaleString('vi-VN')}</p>
              <p><b>Số khách:</b> {reservationDetail.numberOfPeople}</p>
              <p><b>Trạng thái:</b> {reservationDetail.status}</p>
              <p className="col-span-2"><b>Đơn combo:</b> {reservationDetail.orderCode || 'Không có'}</p>
              <p className="col-span-2"><b>Ghi chú:</b> {reservationDetail.note || '—'}</p>
            </div>
            <div className="flex justify-end gap-2">
              {reservationDetail.status === 'PENDING' && (
                <button className="px-4 py-2 text-red-500 font-bold text-xs" onClick={() => void cancelMyReservation(reservationDetail)}>Hủy lịch</button>
              )}
              <button className="btn-secondary text-xs" onClick={() => setReservationDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
