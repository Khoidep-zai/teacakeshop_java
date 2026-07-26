import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Calendar, LogOut, ChevronRight, Sparkles, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getMyOrders } from '../api/orders';
import { getMyReservations } from '../api/reservations';
import type { Order, Reservation } from '../types';

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reservations'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordRes, resRes] = await Promise.allSettled([
          getMyOrders(),
          getMyReservations()
        ]);
        if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value)) setOrders(ordRes.value);
        if (resRes.status === 'fulfilled' && Array.isArray(resRes.value)) setReservations(resRes.value);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="glass-card p-5 space-y-2 h-fit">
          <div className="p-4 text-center border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-cyber-teal text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-lg shadow-primary/20">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white font-serif-title">{user?.fullName || 'Khách Thượng Hạng'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-cyber-teal/10 text-cyber-teal text-[10px] font-black uppercase tracking-wider rounded-full border border-cyber-teal/30">
              <Sparkles size={12} /> Thành Viên Hoàng Gia 2026
            </span>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User size={16} /> Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'orders' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package size={16} /> Đơn hàng của tôi
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
              activeTab === 'reservations' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar size={16} /> Lịch hẹn đặt bàn
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs text-red-500 hover:bg-red-500/10 transition-all pt-4 border-t border-slate-200 dark:border-slate-800"
          >
            <LogOut size={16} /> Đăng xuất tài khoản
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title">Thông Tin Cá Nhân</h2>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-400" /> Hạng Kim Cương
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Họ và tên</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.fullName || 'Khách hàng'}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Email liên hệ</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.email}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Số điện thoại</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.phone || '0901234567'}</p>
                </div>
                <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                  <p className="text-slate-400">Quyền truy cập</p>
                  <p className="font-extrabold text-primary dark:text-primary-glow text-sm">{user?.role}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800">
                Lịch Sử Đơn Hàng Thưởng Trà
              </h2>
              {loading ? (
                <div className="py-10 text-center text-slate-400 text-xs">Đang tải lịch sử...</div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">Bạn chưa có đơn hàng nào.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((ord) => (
                    <Link key={ord.id} to={`/orders/${ord.orderCode}`} className="py-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 px-3 rounded-2xl transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900 dark:text-white font-serif-title">#{ord.orderCode}</p>
                          <span className="text-[10px] px-2.5 py-0.5 bg-primary/10 text-primary font-black uppercase rounded-full">{ord.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(ord.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-sm text-primary dark:text-primary-glow">{(ord.finalAmount || ord.totalAmount).toLocaleString('vi-VN')}₫</p>
                        <ChevronRight size={16} className="text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800">
                Lịch Sử Đặt Bàn Lounge
              </h2>
              {loading ? (
                <div className="py-10 text-center text-slate-400 text-xs">Đang tải lịch sử...</div>
              ) : reservations.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">Bạn chưa có lịch đặt bàn nào.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reservations.map((res) => (
                    <div key={res.id} className="py-4 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white font-serif-title">Mã Hẹn: {res.reservationCode}</p>
                        <p className="text-slate-500 mt-0.5">{res.reservationTime} - Ngày {res.reservationDate} ({res.partySize} khách)</p>
                      </div>
                      <span className="text-[10px] px-3 py-1 bg-accent/10 text-accent font-black uppercase rounded-full">{res.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
