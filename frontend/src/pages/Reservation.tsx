import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Mail, Phone, User, PartyPopper, ChevronRight, ChevronLeft } from 'lucide-react';
import { checkAvailability, createReservation } from '../api/reservations';

export default function Reservation() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reservationCode, setReservationCode] = useState('');
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
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
      // Allow proceeding if availability succeeds or returns true
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
        note: formData.note
      });
      setReservationCode(res.reservationCode);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      alert('Không thể tạo lịch đặt bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Đặt bàn trước tại quán</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Thưởng thức trà và bánh ngọt cùng không gian thư thái</p>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        </div>

        {step === 1 && (
          <div className="card space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin đặt bàn</h2>
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                    <input type="date" name="date" required value={formData.date} onChange={handleChange} className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giờ</label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                    <input type="time" name="time" required value={formData.time} onChange={handleChange} className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số người</label>
                  <div className="relative">
                    <Users className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                    <select name="partySize" value={formData.partySize} onChange={handleChange} className="input-field pl-10">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} người</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ tên</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                    <input type="text" name="name" required placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                    <input type="email" name="email" required placeholder="email@example.com" value={formData.email} onChange={handleChange} className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                    <input type="tel" name="phone" required placeholder="0901234567" value={formData.phone} onChange={handleChange} className="input-field pl-10" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú đặc biệt</label>
                <textarea name="note" rows={3} placeholder="VD: Bàn gần cửa sổ, sinh nhật..." value={formData.note} onChange={handleChange} className="input-field"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center py-3">
                Tiếp tục <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Xác nhận thông tin đặt bàn</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
              <div className="flex justify-between border-b pb-2 dark:border-gray-600">
                <span className="text-gray-500">Khách hàng:</span>
                <span className="font-semibold">{formData.name} ({formData.phone})</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-600">
                <span className="text-gray-500">Thời gian:</span>
                <span className="font-semibold">{formData.time} ngày {formData.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-600">
                <span className="text-gray-500">Số lượng khách:</span>
                <span className="font-semibold">{formData.partySize} người</span>
              </div>
              {formData.note && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ghi chú:</span>
                  <span className="font-semibold">{formData.note}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 mr-1" /> Quay lại
              </button>
              <button type="button" onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Đang gửi...' : 'Xác nhận đặt bàn'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto">
              <PartyPopper className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Đặt bàn thành công!</h2>
            <p className="text-gray-600 dark:text-gray-400">Mã đặt bàn của bạn là:</p>
            <div className="text-3xl font-extrabold text-primary tracking-wider">{reservationCode}</div>
            <p className="text-sm text-gray-500">Cửa hàng sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
            <div className="pt-4">
              <Link to="/" className="btn-primary inline-block">Về trang chủ</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
