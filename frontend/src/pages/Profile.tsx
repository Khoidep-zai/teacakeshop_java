import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Calendar, LogOut, ChevronRight } from 'lucide-react';
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
        if (ordRes.status === 'fulfilled') setOrders(ordRes.value || []);
        if (resRes.status === 'fulfilled') setReservations(resRes.value || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="card space-y-2 h-fit">
          <div className="p-4 text-center border-b dark:border-gray-700">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-3">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 bg-accent/10 text-accent text-xs font-bold rounded-full">
              {user?.role}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'overview' ? 'bg-primary text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <User size={18} /> Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'orders' ? 'bg-primary text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Package size={18} /> Đơn hàng của tôi
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'reservations' ? 'bg-primary text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <Calendar size={18} /> Đặt bàn của tôi
          </button>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all pt-4 border-t dark:border-gray-700"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'overview' && (
            <div className="card space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                  <p className="text-xs text-gray-500">Họ và tên</p>
                  <p className="font-bold text-gray-900 dark:text-white">{user?.fullName}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-bold text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="font-bold text-gray-900 dark:text-white">{user?.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1">
                  <p className="text-xs text-gray-500">Vai trò tài khoản</p>
                  <p className="font-bold text-gray-900 dark:text-white">{user?.role}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lịch sử đơn hàng</h2>
              {loading ? (
                <div className="py-10 text-center text-gray-400">Đang tải...</div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center text-gray-500">Bạn chưa có đơn hàng nào</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((ord) => (
                    <Link key={ord.id} to={`/orders/${ord.orderCode}`} className="py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 px-2 rounded-xl transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-white">#{ord.orderCode}</p>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full">{ord.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(ord.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-extrabold text-primary">{(ord.finalAmount || ord.totalAmount).toLocaleString('vi-VN')}₫</p>
                        <ChevronRight size={18} className="text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="card space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lịch sử đặt bàn</h2>
              {loading ? (
                <div className="py-10 text-center text-gray-400">Đang tải...</div>
              ) : reservations.length === 0 ? (
                <div className="py-10 text-center text-gray-500">Bạn chưa có lịch đặt bàn nào</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {reservations.map((res) => (
                    <div key={res.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Mã: {res.reservationCode}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{res.reservationTime} - Ngày {res.reservationDate} ({res.partySize} khách)</p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-accent/10 text-accent font-bold rounded-full">{res.status}</span>
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
