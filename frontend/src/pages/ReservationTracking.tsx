import { useState } from 'react';
import { CalendarCheck, Search, XCircle } from 'lucide-react';
import { cancelReservation, getReservation } from '../api/reservations';
import type { Reservation } from '../types';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<Reservation['status'], string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SEATED: 'Khách đã đến',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Khách không đến',
};

export default function ReservationTracking() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    try {
      setReservation(await getReservation(code.trim(), phone.trim()));
    } catch (error: any) {
      setReservation(null);
      toast.error(error?.response?.data?.message || 'Không tìm thấy lịch đặt bàn phù hợp.');
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!reservation || !window.confirm(`Bạn chắc chắn muốn hủy lịch ${reservation.reservationCode}?`)) return;
    try {
      const updated = await cancelReservation(reservation.reservationCode, phone.trim());
      setReservation(updated);
      toast.success('Đã hủy lịch đặt bàn.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lịch đặt bàn không đủ điều kiện hủy.');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-8 text-center">
        <CalendarCheck className="w-12 h-12 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-extrabold font-serif-title">Tra Cứu Lịch Đặt Bàn</h1>
        <p className="text-sm text-slate-500 mt-2">Nhập đúng mã đặt bàn và số điện thoại đã sử dụng.</p>
      </div>

      <form onSubmit={lookup} className="glass-card p-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input className="input-field" value={code} onChange={event => setCode(event.target.value)} placeholder="Mã đặt bàn" required />
        <input className="input-field" value={phone} onChange={event => setPhone(event.target.value)} placeholder="Số điện thoại" required />
        <button className="btn-primary" disabled={loading}><Search size={16} /> {loading ? 'Đang tìm...' : 'Tra cứu'}</button>
      </form>

      {reservation && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">#{reservation.reservationCode}</h2>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {STATUS_LABELS[reservation.status]}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <p><b>Khách hàng:</b><br />{reservation.customerName}<br />{reservation.customerEmail}</p>
            <p><b>Thời gian:</b><br />{new Date(reservation.reservationTime).toLocaleString('vi-VN')}</p>
            <p><b>Số khách:</b> {reservation.numberOfPeople}</p>
            <p><b>Đơn combo:</b> {reservation.orderCode || 'Không có'}</p>
            <p className="sm:col-span-2"><b>Ghi chú:</b> {reservation.note || '—'}</p>
          </div>
          {reservation.status === 'PENDING' && (
            <button className="flex items-center gap-2 text-red-500 font-bold text-sm" onClick={() => void cancel()}>
              <XCircle size={16} /> Hủy lịch đặt bàn
            </button>
          )}
        </div>
      )}
    </div>
  );
}
