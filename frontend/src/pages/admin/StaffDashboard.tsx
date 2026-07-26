import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, CreditCard, Package, ShoppingCart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAdminOrders } from '../../api/orders';
import { getAdminReservations } from '../../api/reservations';
import { getAdminPayments } from '../../api/payments';
import type { Order, Page, Payment, Reservation } from '../../types';

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    Promise.all([
      getAdminOrders({ page: 0, size: 100 }),
      getAdminReservations({ page: 0, size: 100 }),
      getAdminPayments({ page: 0, size: 100 }),
    ]).then(([orderPage, reservationPage, paymentPage]) => {
      setOrders((orderPage as Page<Order>).content || []);
      setReservations((reservationPage as Page<Reservation>).content || []);
      setPayments((paymentPage as Page<Payment>).content || []);
    }).catch((error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể tải tổng quan công việc');
    });
  }, []);

  const cards = [
    {
      label: 'Đơn chờ xác nhận',
      value: orders.filter(item => item.status === 'PENDING').length,
      icon: Clock,
      path: '/admin/orders',
      color: 'text-amber-600',
    },
    {
      label: 'Đơn đang chuẩn bị',
      value: orders.filter(item => item.status === 'PREPARING').length,
      icon: Package,
      path: '/admin/orders',
      color: 'text-sky-600',
    },
    {
      label: 'Lịch chờ xác nhận',
      value: reservations.filter(item => item.status === 'PENDING').length,
      icon: CalendarCheck,
      path: '/admin/reservations',
      color: 'text-violet-600',
    },
    {
      label: 'Khách sắp/đã đến',
      value: reservations.filter(item => item.status === 'CONFIRMED' || item.status === 'SEATED').length,
      icon: Users,
      path: '/admin/reservations',
      color: 'text-emerald-600',
    },
    {
      label: 'Giao dịch đang chờ',
      value: payments.filter(item => item.status === 'PENDING').length,
      icon: CreditCard,
      path: '/admin/payments',
      color: 'text-rose-600',
    },
  ];

  return <div className="space-y-6 max-w-7xl mx-auto">
    <header className="glass-card p-6">
      <p className="text-xs font-bold uppercase text-primary">Staff Operations</p>
      <h1 className="text-3xl font-extrabold flex items-center gap-3">
        <ShoppingCart /> Tổng quan công việc
      </h1>
      <p className="text-sm text-slate-500 mt-2">
        Các số liệu vận hành cần xử lý, không bao gồm báo cáo tài chính quản trị.
      </p>
    </header>
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return <Link key={card.label} to={card.path} className="glass-card p-5 hover:-translate-y-1 transition-transform">
          <Icon className={`w-7 h-7 ${card.color}`} />
          <p className="text-3xl font-extrabold mt-4">{card.value}</p>
          <p className="text-xs font-bold text-slate-500 mt-1">{card.label}</p>
        </Link>;
      })}
    </div>
  </div>;
}
