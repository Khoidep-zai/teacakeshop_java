import { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { getAdminReservations, updateReservationStatus as updateApiResStatus } from '../../api/reservations';
import type { Reservation } from '../../types';
import toast from 'react-hot-toast';

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getAdminReservations();
      const list = (data as any).content || data;
      if (Array.isArray(list)) {
        setReservations(list);
      } else {
        setReservations([]);
      }
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (resId: number, status: Reservation['status']) => {
    try {
      await updateApiResStatus(resId, status);
      toast.success(`Đã cập nhật lịch đặt bàn sang "${status}"! ✨`, {
        style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
      });
      // Refresh từ API để đồng bộ
      await fetchReservations();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái.';
      toast.error(msg);
    }
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
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có lịch đặt bàn nào.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary flex items-center gap-1.5">
                      <CalendarCheck size={14} />
                      <span>#{res.reservationCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{res.customerName || 'Khách hàng'}</p>
                      <p className="text-[11px] text-slate-400">{res.customerPhone || '0901234567'} - {res.customerEmail || ''}</p>
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
                      ) : res.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                          <CheckCircle2 size={12} /> Đã đón khách
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">
                          <XCircle size={12} /> Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusChange(res.id, e.target.value as any)}
                        className="input-field text-xs font-extrabold py-1 px-2 text-center"
                      >
                        <option value="CONFIRMED">Xác nhận giữ chỗ ✅</option>
                        <option value="COMPLETED">Đã đón khách xong</option>
                        <option value="CANCELLED">Hủy lịch đặt</option>
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
