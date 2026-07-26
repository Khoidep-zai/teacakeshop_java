import { useEffect, useState } from 'react';
import { AlertCircle, CalendarRange, Coffee, DollarSign, ShoppingCart, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import {
  getDailyRevenue, getDashboardOverview, getLowStock, getTopCombos, getTopProducts,
} from '../../api/admin';
import type { DailyRevenue, DashboardOverview, LowStockProduct, TopProduct } from '../../types';

const money = (value = 0) => `${Number(value).toLocaleString('vi-VN')}₫`;
const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenue, setRevenue] = useState<DailyRevenue[]>([]);
  const [topItems, setTopItems] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (startDate > endDate) {
      toast.error('Ngày bắt đầu không được sau ngày kết thúc');
      return;
    }
    setLoading(true);
    try {
      const [summary, daily, products, combos, stock] = await Promise.all([
        getDashboardOverview(),
        getDailyRevenue(startDate, endDate),
        getTopProducts(),
        getTopCombos(),
        getLowStock(),
      ]);
      setOverview(summary);
      setRevenue(daily);
      setTopItems([...products, ...combos].sort((a, b) => b.soldQuantity - a.soldQuantity).slice(0, 8));
      setLowStock(stock);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const orderStatus = overview ? [
    { name: 'Chờ xác nhận', value: overview.pendingOrders, color: '#f59e0b' },
    { name: 'Đã xác nhận', value: overview.confirmedOrders, color: '#3b82f6' },
    { name: 'Đang chuẩn bị', value: overview.preparingOrders, color: '#8b5cf6' },
    { name: 'Hoàn thành', value: overview.completedOrders, color: '#10b981' },
    { name: 'Đã hủy', value: overview.cancelledOrders, color: '#ef4444' },
  ] : [];

  const reservationStatus = overview ? [
    { name: 'Chờ xác nhận', value: overview.pendingReservations },
    { name: 'Đã xác nhận', value: overview.confirmedReservations },
    { name: 'Khách đã đến', value: overview.seatedReservations },
    { name: 'Hoàn thành', value: overview.completedReservations },
    { name: 'Không đến', value: overview.noShowReservations },
    { name: 'Đã hủy', value: overview.cancelledReservations },
  ] : [];

  if (loading && !overview) {
    return <div className="py-20 text-center text-slate-500">Đang tải số liệu thực tế từ hệ thống…</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Báo cáo từ backend</p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Dashboard tổng quan</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-bold">Từ ngày
            <input className="input-field mt-1" type="date" value={startDate} max={endDate}
              onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="text-xs font-bold">Đến ngày
            <input className="input-field mt-1" type="date" value={endDate} min={startDate} max={today}
              onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <button className="btn-primary h-11 px-5" onClick={() => void load()} disabled={loading}>
            <CalendarRange size={16} /> Áp dụng
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {([
          ['Tổng doanh thu', money(overview?.totalRevenue), DollarSign, 'text-emerald-600'],
          ['Tổng đơn hàng', overview?.totalOrders ?? 0, ShoppingCart, 'text-sky-600'],
          ['Đơn chờ xử lý', overview?.pendingOrders ?? 0, AlertCircle, 'text-amber-600'],
          ['Đơn hoàn thành', overview?.completedOrders ?? 0, ShoppingCart, 'text-emerald-600'],
          ['Đơn đã hủy', overview?.cancelledOrders ?? 0, AlertCircle, 'text-red-600'],
          ['Tổng lượt đặt bàn', overview?.totalReservations ?? 0, Coffee, 'text-purple-600'],
          ['Khách đã đến', overview?.seatedReservations ?? 0, Users, 'text-cyan-600'],
          ['Khách không đến', overview?.noShowReservations ?? 0, Users, 'text-rose-600'],
        ] as Array<[string, string | number, LucideIcon, string]>).map(([label, value, Icon, color]) => (
          <div className="glass-card p-5 flex gap-4 items-center" key={String(label)}>
            <Icon className={`w-7 h-7 ${color}`} />
            <div><p className="text-xs text-slate-500 font-bold">{label}</p>
              <p className="text-xl font-extrabold">{String(value)}</p></div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <section className="glass-card p-6">
          <h2 className="font-extrabold mb-5">Doanh thu theo khoảng thời gian</h2>
          <div className="h-72"><ResponsiveContainer>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000000)}M`} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Line dataKey="revenue" stroke="#2D6A4F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer></div>
        </section>
        <section className="glass-card p-6">
          <h2 className="font-extrabold mb-5">Đơn hàng theo trạng thái</h2>
          <div className="h-72"><ResponsiveContainer>
            <PieChart><Pie data={orderStatus} dataKey="value" nameKey="name" outerRadius={95} label>
              {orderStatus.map((item) => <Cell key={item.name} fill={item.color} />)}
            </Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer></div>
        </section>
      </div>

      <section className="glass-card p-6">
        <h2 className="font-extrabold mb-5">Đặt bàn theo trạng thái</h2>
        <div className="h-64"><ResponsiveContainer>
          <BarChart data={reservationStatus}><CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip />
            <Bar dataKey="value" fill="#06b6d4" /></BarChart>
        </ResponsiveContainer></div>
      </section>

      <div className="grid xl:grid-cols-2 gap-6">
        <section className="glass-card overflow-hidden">
          <h2 className="font-extrabold p-6 border-b">Sản phẩm và combo bán chạy</h2>
          <table className="w-full text-sm"><tbody>
            {topItems.map((item) => <tr className="border-b last:border-0" key={`${item.itemType}-${item.itemId}`}>
              <td className="p-4 font-bold">{item.itemName}</td><td>{item.itemType}</td>
              <td>{item.soldQuantity} đã bán</td><td className="pr-4 text-right">{money(item.revenue)}</td>
            </tr>)}
            {!topItems.length && <tr><td className="p-8 text-center text-slate-500">Chưa có dữ liệu bán hàng</td></tr>}
          </tbody></table>
        </section>
        <section className="glass-card overflow-hidden">
          <h2 className="font-extrabold p-6 border-b">Cảnh báo tồn kho</h2>
          <table className="w-full text-sm"><tbody>
            {lowStock.map((item) => <tr className="border-b last:border-0" key={item.productId}>
              <td className="p-4 font-bold">{item.productName}</td><td>{item.categoryName}</td>
              <td className={`pr-4 text-right font-extrabold ${item.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                {item.stockQuantity === 0 ? 'Hết hàng' : `Còn ${item.stockQuantity}`}
              </td>
            </tr>)}
            {!lowStock.length && <tr><td className="p-8 text-center text-slate-500">Không có sản phẩm sắp hết hàng</td></tr>}
          </tbody></table>
        </section>
      </div>
    </div>
  );
}
