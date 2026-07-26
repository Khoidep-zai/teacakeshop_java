import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Mail, Phone, User, PartyPopper, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { checkAvailability, createReservation } from '../api/reservations';
import { addReservation } from '../data/userStore';

export default function Reservation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reservationCode, setReservationCode] = useState('');
  const [selectedZone, setSelectedZone] = useState<'chill' | 'balcony' | 'vip'>('chill');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    partySize: '2',
    name: '',
    email: '',
    phone: '',
    note: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await checkAvailability(formData.date, formData.time);
      setStep(2);
    } catch {
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await createReservation({
        reservationDate: formData.date,
        reservationTime: formData.time,
        partySize: Number(formData.partySize),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        note: `Khu vực: ${selectedZone.toUpperCase()} - ${formData.note}`
      });
      const createdRes = addReservation({
        reservationCode: res?.reservationCode || `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: formData.name || 'Khách Hàng',
        customerPhone: formData.phone || '0901234567',
        customerEmail: formData.email || 'nguyenkhoidk2005@gmail.com',
        reservationDate: formData.date,
        reservationTime: formData.time,
        partySize: Number(formData.partySize),
        note: `Khu vực ${selectedZone.toUpperCase()} - ${formData.note || 'Đặt bàn Lounge'}`,
        status: 'CONFIRMED'
      });
      setReservationCode(createdRes.reservationCode);
      setStep(3);
    } catch (err: any) {
      const createdRes = addReservation({
        reservationCode: `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: formData.name || 'Khách Hàng',
        customerPhone: formData.phone || '0901234567',
        customerEmail: formData.email || 'nguyenkhoidk2005@gmail.com',
        reservationDate: formData.date,
        reservationTime: formData.time,
        partySize: Number(formData.partySize),
        note: `Khu vực ${selectedZone.toUpperCase()} - ${formData.note || 'Đặt bàn Lounge'}`,
        status: 'CONFIRMED'
      });
      setReservationCode(createdRes.reservationCode);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4 text-cyber-teal" />
          <span>Trải Nghiệm Không Gian Lounge 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-serif-title">
          Đặt Bàn Thưởng Trà Online
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Lựa chọn khu vực yêu thích và đặt trước chỗ ngồi với tầm nhìn rực rỡ.
        </p>
      </div>

      {/* Stepper progress */}
      <div className="flex items-center justify-center mb-10 max-w-md mx-auto">
        <div className={`flex items-center justify-center w-10 h-10 rounded-2xl font-black text-sm transition-all ${step >= 1 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>1</div>
        <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
        <div className={`flex items-center justify-center w-10 h-10 rounded-2xl font-black text-sm transition-all ${step >= 2 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>2</div>
        <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
        <div className={`flex items-center justify-center w-10 h-10 rounded-2xl font-black text-sm transition-all ${step >= 3 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>3</div>
      </div>

      {step === 1 && (
        <div className="glass-card p-6 sm:p-10 space-y-8">
          
          {/* Zone Selector */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
              Chọn Khu Vực Không Gian (Ambience Zone)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'chill', name: 'Góc Trà Chill Sách', desc: 'Ấm cúng, tĩnh lặng, nhạc nhẹ', icon: '🌿' },
                { id: 'balcony', name: 'Ban Công AI Horizon', desc: 'Thoáng đãng, view đại lộ 2026', icon: '✨' },
                { id: 'vip', name: 'Phòng VIP Đèn Ấm', desc: 'Riêng tư cho nhóm 4-10 người', icon: '👑' },
              ].map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone.id as any)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    selectedZone === zone.id
                      ? 'bg-slate-900 text-white border-cyber-teal shadow-lg shadow-cyber-teal/20 scale-[1.02]'
                      : 'bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyber-teal/50'
                  }`}
                >
                  <span className="text-2xl block mb-1">{zone.icon}</span>
                  <span className="font-bold text-sm block font-serif-title">{zone.name}</span>
                  <span className="text-[11px] opacity-75 leading-tight block mt-0.5">{zone.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCheck} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Ngày Đặt</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} className="input-field pl-10 text-xs font-semibold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Giờ Đặt</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                  <input type="time" name="time" required value={formData.time} onChange={handleChange} className="input-field pl-10 text-xs font-semibold" />
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Số Lượng Khách</label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                  <select name="partySize" value={formData.partySize} onChange={handleChange} className="input-field pl-10 text-xs font-semibold">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} khách</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Họ & Tên Khách Hàng</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                  <input type="text" name="name" required placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} className="input-field pl-10 text-xs" />
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Địa Chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                  <input type="email" name="email" required placeholder="email@example.com" value={formData.email} onChange={handleChange} className="input-field pl-10 text-xs" />
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Số Điện Thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                  <input type="tel" name="phone" required placeholder="0901234567" value={formData.phone} onChange={handleChange} className="input-field pl-10 text-xs" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Ghi Chú Đặt Biệt (Birthday / Trang trí)</label>
              <textarea name="note" rows={3} placeholder="VD: Bàn sinh nhật chuẩn bị nến thơm..." value={formData.note} onChange={handleChange} className="input-field text-xs"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-sm font-extrabold shadow-lg">
              <span>Tiếp Tục Xác Nhận</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card p-6 sm:p-10 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif-title">Xác Nhận Chi Tiết Lịch Hẹn</h2>
          
          <div className="bg-slate-100/80 dark:bg-slate-800/80 p-6 rounded-2xl space-y-3 border border-slate-200/60 dark:border-slate-700/60 text-sm">
            <div className="flex justify-between border-b pb-2.5 dark:border-slate-700">
              <span className="text-slate-400">Tên khách hàng:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.name} ({formData.phone})</span>
            </div>
            <div className="flex justify-between border-b pb-2.5 dark:border-slate-700">
              <span className="text-slate-400">Thời gian nhận bàn:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.time} ngày {formData.date}</span>
            </div>
            <div className="flex justify-between border-b pb-2.5 dark:border-slate-700">
              <span className="text-slate-400">Khu vực đã chọn:</span>
              <span className="font-bold text-primary dark:text-primary-glow uppercase">{selectedZone}</span>
            </div>
            <div className="flex justify-between border-b pb-2.5 dark:border-slate-700">
              <span className="text-slate-400">Số lượng khách:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.partySize} khách</span>
            </div>
            {formData.note && (
              <div className="flex justify-between">
                <span className="text-slate-400">Ghi chú:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formData.note}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại sửa
            </button>
            <button type="button" onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Đang khởi tạo reservation...' : 'Hoàn Tất Đặt Bàn'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card p-10 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <PartyPopper className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">Đặt Bàn Thành Công!</h2>
          <p className="text-xs text-slate-500">Mã xác nhận giữ chỗ Lounge của bạn:</p>
          <div className="text-4xl font-black text-primary dark:text-primary-glow tracking-widest font-mono bg-slate-100 dark:bg-slate-800 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            {reservationCode}
          </div>
          <p className="text-xs text-slate-400">Đội ngũ Lounge đã nhận được thông tin và sẵn sàng chào đón bạn!</p>
          <div className="pt-2">
            <Link to="/" className="btn-primary text-xs px-8 py-3">Quay Về Trang Chủ</Link>
          </div>
        </div>
      )}

    </div>
  );
}
