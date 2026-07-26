import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, Sparkles, ChevronRight, Calendar } from 'lucide-react';
import { getUserOrders, getUserReservations } from '../../data/userStore';
import type { Order, Reservation } from '../../types';

export const ActiveTrackerBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeRes, setActiveRes] = useState<Reservation | null>(null);

  const checkActiveItems = () => {
    const orders = getUserOrders();
    const activeOrd = orders.find(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    setActiveOrder(activeOrd || null);

    const reservations = getUserReservations();
    const activeR = reservations.find(r => r.status !== 'CANCELLED' && r.status !== 'COMPLETED');
    setActiveRes(activeR || null);
  };

  useEffect(() => {
    checkActiveItems();
    window.addEventListener('user_store_updated', checkActiveItems);
    return () => window.removeEventListener('user_store_updated', checkActiveItems);
  }, []);

  // Do not show inside admin pages
  if (location.pathname.startsWith('/admin')) return null;

  if (!activeOrder && !activeRes) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Đang tiếp nhận đơn ⏳', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'CONFIRMED':
        return { text: 'Đang chế biến & pha chế 🍵', bg: 'bg-cyber-teal/20 text-cyber-teal border-cyber-teal/40' };
      case 'SHIPPING':
        return { text: 'Đang giao hàng tới bạn 🚚', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'COMPLETED':
        return { text: 'Đã hoàn tất ✅', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default:
        return { text: 'Đang xử lý...', bg: 'bg-primary/20 text-primary border-primary/40' };
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md w-full px-4 sm:px-0">
      <div 
        onClick={() => {
          if (activeOrder) navigate(`/orders/${activeOrder.orderCode}`);
          else navigate('/profile');
        }}
        className="glass-card p-4 border border-cyber-teal/40 shadow-2xl bg-slate-950/90 text-white backdrop-blur-xl rounded-3xl cursor-pointer hover:scale-[1.02] transition-all flex items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-cyber-teal flex items-center justify-center text-white font-bold shadow-md shadow-primary/30 flex-shrink-0">
            {activeOrder ? <Truck className="w-5 h-5 animate-pulse" /> : <Calendar className="w-5 h-5" />}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-cyber-teal uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {activeOrder ? `Đơn hàng #${activeOrder.orderCode}` : `Lịch đặt bàn #${activeRes?.reservationCode}`}
              </span>
            </div>

            {activeOrder ? (
              <p className="text-xs font-bold text-white line-clamp-1">
                {activeOrder.items[0]?.name || 'Đơn hàng trà bánh'} ({activeOrder.finalAmount.toLocaleString('vi-VN')}₫)
              </p>
            ) : (
              <p className="text-xs font-bold text-white">
                {activeRes?.note || 'Đặt bàn Lounge'} - {activeRes?.reservationTime} ({activeRes?.partySize} khách)
              </p>
            )}

            <div className="flex items-center gap-2 pt-0.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(activeOrder?.status || activeRes?.status || '').bg}`}>
                {getStatusBadge(activeOrder?.status || activeRes?.status || '').text}
              </span>
            </div>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </div>
  );
};
