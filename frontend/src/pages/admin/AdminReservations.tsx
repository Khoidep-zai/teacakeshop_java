import { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Sparkles, Clock, Search } from 'lucide-react';
import { getAdminReservation, getAdminReservations, updateReservationStatus as updateApiResStatus } from '../../api/reservations';
import { getAdminPaymentSummary } from '../../api/payments';
import type { OrderPaymentSummary, Reservation } from '../../types';
import toast from 'react-hot-toast';

const RESERVATION_STATUS_LABELS: Record<Reservation['status'], string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã giữ chỗ',
  SEATED: 'Đã đón khách',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Khách không đến',
};

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<OrderPaymentSummary | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getAdminReservations({
        page: 0,
        size: 100,
        keyword: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        date: dateFilter || undefined,
        fromTime: fromTime || undefined,
        toTime: toTime || undefined,
      });
      const list = (data as any).content || data;
      if (Array.isArray(list)) {
        setReservations(list);
      } else {
        setReservations([]);
      }
    } catch (err: any) {
      setReservations([]);
      toast.error(err?.response?.data?.message || 'Không thể tải lịch đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (resId: number, status: Reservation['status']) => {
    setUpdatingId(resId);
    try {
      const updated = await updateApiResStatus(resId, status) as Reservation;
      setReservations(current => current.map(item => item.id === resId ? updated : item));
      toast.success(`Đã cập nhật lịch đặt bàn sang "${RESERVATION_STATUS_LABELS[status]}"! ✨`, {
        style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
      });
      await fetchReservations();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái.';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatuses = (current: Reservation['status']): Reservation['status'][] => ({
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SEATED', 'CANCELLED', 'NO_SHOW'],
    SEATED: ['COMPLETED'],
    COMPLETED: [], CANCELLED: [], NO_SHOW: [],
  }[current] as Reservation['status'][]);

  const filtered = reservations.filter(item => statusFilter === 'ALL' || item.status === statusFilter)
    .filter(item => `${item.reservationCode} ${item.customerName} ${item.customerPhone}`.toLowerCase().includes(search.toLowerCase()));

  const openDetail = async (id: number) => {
    try {
      const reservation = await getAdminReservation(id);
      setDetail(reservation);
      setPaymentSummary(
        reservation.orderId
          ? await getAdminPaymentSummary(reservation.orderId)
          : null
      );
    }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Không thể tải chi tiết lịch'); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Quản Lý Lịch Hẹn Đặt Bàn Lounge 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Danh Sách Lịch Đặt Bàn Khách Hàng ({reservations.length})
          </h1>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-3.5 w-4" />
          <input className="input-field pl-10" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Mã đặt bàn, tên hoặc số điện thoại" /></div>
        <select className="input-field w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">Mọi trạng thái</option>
          {(Object.keys(RESERVATION_STATUS_LABELS) as Reservation['status'][])
            .map(value => <option key={value} value={value}>{RESERVATION_STATUS_LABELS[value]}</option>)}
        </select>
        <input type="date" className="input-field w-44" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <input type="time" className="input-field w-36" value={fromTime} onChange={e => setFromTime(e.target.value)} title="Từ giờ" />
        <input type="time" className="input-field w-36" value={toTime} onChange={e => setToTime(e.target.value)} title="Đến giờ" />
        <button className="btn-primary text-xs px-4" onClick={() => void fetchReservations()}>Áp dụng</button>
      </div>

      {/* Reservations Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Mã Đặt Bàn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Thời Gian & Ngày</th>
                <th className="px-6 py-4">Số Khách</th>
                <th className="px-6 py-4">Ghi Chú Đặt Bàn</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Cập Nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải lịch đặt bàn...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có lịch đặt bàn nào.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary flex items-center gap-1.5">
                      <CalendarCheck size={14} />
                      <button className="underline" onClick={() => void openDetail(res.id)}>#{res.reservationCode}</button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{res.customerName || 'Khách hàng'}</p>
                      <p className="text-[11px] text-slate-400">{res.customerPhone || 'Không có SĐT'} - {res.customerEmail || ''}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {(() => {
                        const dt = res.reservationTime ? new Date(res.reservationTime) : null;
                        const valid = dt && !isNaN(dt.getTime());
                        return valid
                          ? `${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} Ngày ${dt.toLocaleDateString('vi-VN')}`
                          : `${res.reservationTime || '--:--'} Ngày ${res.reservationDate || '---'}`;
                      })()}
                    </td>
                    <td className="px-6 py-4 font-semibold">{res.numberOfPeople ?? res.partySize ?? '?'} khách</td>
                    <td className="px-6 py-4 font-bold text-cyber-teal">{res.note || 'Đặt bàn Lounge'}</td>
                    <td className="px-6 py-4">
                      {res.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Đã giữ chỗ
                        </span>
                      ) : res.status === 'SEATED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                          <CheckCircle2 size={12} /> Đã đón khách
                        </span>
                      ) : res.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Hoàn thành
                        </span>
                      ) : res.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Clock size={12} /> Đang chờ xác nhận
                        </span>
                      ) : res.status === 'NO_SHOW' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                          <XCircle size={12} /> Khách không đến
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">
                          <XCircle size={12} /> Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {nextStatuses(res.status).length ? (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) void handleStatusChange(res.id, e.target.value as Reservation['status']);
                          }}
                          disabled={updatingId === res.id}
                          className="input-field text-xs font-extrabold py-1 px-2 text-center"
                        >
                          <option value="">{updatingId === res.id ? 'Đang cập nhật...' : 'Chọn bước tiếp theo'}</option>
                          {nextStatuses(res.status).map(value => (
                            <option key={value} value={value}>{RESERVATION_STATUS_LABELS[value]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="block text-center text-[11px] font-bold text-slate-400">
                          Đã kết thúc
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
        <div className="glass-card p-6 w-full max-w-xl space-y-4">
          <h2 className="text-xl font-extrabold">Chi tiết lịch #{detail.reservationCode}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><b>Khách:</b><br />{detail.customerName}<br />{detail.customerPhone}<br />{detail.customerEmail}</p>
            <p><b>Thời gian:</b><br />{new Date(detail.reservationTime).toLocaleString('vi-VN')}<br />
              <b>Số người:</b> {detail.numberOfPeople}</p>
            <p><b>Trạng thái:</b> {detail.status}</p>
            <p><b>Đơn liên kết:</b> {detail.orderCode || 'Không có'}</p>
          </div>
          <p><b>Ghi chú:</b> {detail.note || '—'}</p>
          {paymentSummary && <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 text-sm">
            <h3 className="font-extrabold">Tiền cọc và thanh toán</h3>
            <p>Cọc yêu cầu: <b>{paymentSummary.requiredDepositAmount.toLocaleString('vi-VN')}₫</b></p>
            <p>Đã trả: <b>{paymentSummary.paidAmount.toLocaleString('vi-VN')}₫</b> ·
              Còn lại: <b>{paymentSummary.outstandingAmount.toLocaleString('vi-VN')}₫</b></p>
          </div>}
          <button className="btn-secondary float-right" onClick={() => { setDetail(null); setPaymentSummary(null); }}>Đóng</button>
        </div>
      </div>}

    </div>
  );
}
