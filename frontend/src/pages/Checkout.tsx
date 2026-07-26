import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Landmark, Smartphone, ShieldCheck, Sparkles, Lock, MapPin } from 'lucide-react';
import { checkout } from '../api/orders';
import { simulatePayment, cashOnDelivery } from '../api/payments';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { addOrder } from '../data/userStore';
import type { OrderType } from '../types';

const PAYMENT_METHODS = [
  { id: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng (COD)', icon: Banknote },
  { id: 'MOMO_SIMULATION', label: 'Momo Ví Điện Tử', icon: Smartphone },
  { id: 'VNPAY_SIMULATION', label: 'VNPay QR Code', icon: CreditCard },
  { id: 'BANK_TRANSFER', label: 'Chuyển Khoản Ngân Hàng Quick Pay', icon: Landmark },
];

const ORDER_TYPES: { id: OrderType; label: string }[] = [
  { id: 'NORMAL', label: 'Giao hàng tận nơi' },
  { id: 'TAKEAWAY_PREORDER', label: 'Đặt trước - Tự lấy' },
  { id: 'RESERVATION_COMBO', label: 'Kết hợp đặt bàn' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, token, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingAddress: '',
    note: '',
  });
  const [orderType, setOrderType] = useState<OrderType>('NORMAL');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !token) {
      toast.error('Giỏ hàng không hợp lệ. Vui lòng thử lại.');
      return;
    }

    if (!formData.customerName.trim()) {
      toast.error('Vui lòng nhập họ và tên.');
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!formData.customerEmail.trim()) {
      toast.error('Vui lòng nhập email.');
      return;
    }
    if (orderType === 'NORMAL' && !formData.shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng cho đơn giao tận nơi.');
      return;
    }

    setLoading(true);
    try {
      // Gọi checkout API với đầy đủ thông tin
      const order = await checkout({
        cartToken: token,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        shippingAddress: formData.shippingAddress.trim() || null,
        orderType: orderType,
        note: formData.note.trim() || null,
      });

      // Tạo payment sau khi đặt hàng thành công
      if (order?.id) {
        try {
          if (paymentMethod === 'CASH_ON_DELIVERY') {
            await cashOnDelivery({
              orderId: order.id,
              note: formData.note.trim() || undefined,
            });
          } else {
            await simulatePayment({
              orderId: order.id,
              paymentMethod: paymentMethod,
              purpose: order.depositRequired ? 'DEPOSIT' : 'FULL',
              note: formData.note.trim() || undefined,
            });
          }
        } catch (payErr) {
          // Payment có thể thất bại nhưng order vẫn đã tạo thành công
          console.warn('Payment init warning (non-critical):', payErr);
        }
      }

      // Lưu vào local store để hiển thị ngay khi offline
      addOrder({
        orderCode: order?.orderCode,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        note: formData.note,
        status: order?.status || 'PENDING',
        orderType: order?.orderType || orderType,
        totalAmount: order?.totalAmount ?? cart.totalAmount,
        finalAmount: order?.totalAmount ?? cart.totalAmount,
        shippingAddress: formData.shippingAddress || undefined,
        items: order?.items?.map((i) => ({
          id: i.id,
          itemType: i.itemType,
          itemName: i.itemName,
          name: i.itemName,
          imageUrl: i.imageUrl,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: i.lineTotal,
          totalPrice: i.lineTotal,
        })) ?? cart.items.map((i, idx) => ({
          id: idx + 1,
          itemType: i.itemType,
          itemName: i.productName || i.comboName || 'Sản phẩm',
          name: i.productName || i.comboName || 'Sản phẩm',
          imageUrl: i.imageUrl,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: i.totalPrice,
          totalPrice: i.totalPrice,
        })),
      });

      await clearCart();
      toast.success('Đặt hàng thành công! ✨', {
        style: { borderRadius: '20px', background: '#0F172A', color: '#fff' },
      });
      navigate(`/orders/${order?.orderCode}?phone=${encodeURIComponent(formData.customerPhone)}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.';
      toast.error(msg, { style: { borderRadius: '20px' } });
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-4 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white font-serif-title">Giỏ hàng đang trống</h2>
        <button onClick={() => navigate('/products')} className="btn-primary text-xs px-6 py-2.5">
          Quay lại chọn sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      
      <div className="mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyber-teal" />
          <span>Quy trình Thanh toán An toàn 2026</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif-title mt-1">
          Hoàn Tất Đơn Hàng Thưởng Trà
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form & Payment */}
        <div className="lg:w-2/3 space-y-6">
          
          {/* Order Type */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title border-b border-slate-200 dark:border-slate-800 pb-3">
              1. Loại Đơn Hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ORDER_TYPES.map((ot) => {
                const selected = orderType === ot.id;
                return (
                  <div
                    key={ot.id}
                    onClick={() => setOrderType(ot.id)}
                    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-3 transition-all border ${
                      selected
                        ? 'bg-slate-900 text-white border-cyber-teal shadow-lg shadow-cyber-teal/20 scale-[1.02]'
                        : 'bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs">{ot.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title border-b border-slate-200 dark:border-slate-800 pb-3">
              2. Thông Tin Nhận Hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Họ và Tên *</label>
                <input type="text" name="customerName" required value={formData.customerName} onChange={handleInputChange} className="input-field text-xs" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Số Điện Thoại *</label>
                <input type="tel" name="customerPhone" required value={formData.customerPhone} onChange={handleInputChange} className="input-field text-xs" placeholder="0901234567" />
              </div>
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Email Nhận Hóa Đơn *</label>
              <input type="email" name="customerEmail" required value={formData.customerEmail} onChange={handleInputChange} className="input-field text-xs" placeholder="email@example.com" />
            </div>
            {orderType === 'NORMAL' && (
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  <MapPin className="inline w-3.5 h-3.5 mr-1" />
                  Địa Chỉ Giao Hàng *
                </label>
                <input
                  type="text"
                  name="shippingAddress"
                  required={orderType === 'NORMAL'}
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  className="input-field text-xs"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                />
              </div>
            )}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Ghi Chú Thêm</label>
              <textarea name="note" rows={3} value={formData.note} onChange={handleInputChange} className="input-field text-xs" placeholder="Ghi chú đặc biệt cho đơn hàng (ít ngọt, không đá, dị ứng...)"></textarea>
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title border-b border-slate-200 dark:border-slate-800 pb-3">
              3. Phương Thức Thanh Toán
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const selected = paymentMethod === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-3 transition-all border ${
                      selected
                        ? 'bg-slate-900 text-white border-cyber-teal shadow-lg shadow-cyber-teal/20 scale-[1.02]'
                        : 'bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Icon className={selected ? 'text-cyber-teal' : 'text-slate-400'} size={20} />
                    <span className="font-bold text-xs">{pm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:w-1/3">
          <div className="glass-card-static p-6 sticky top-28 space-y-4">
            <h2 className="text-xl font-bold font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800">
              Đơn Hàng Của Bạn
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="pt-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.productName || item.comboName}</p>
                    <p className="text-[11px] text-slate-400">Số lượng: x{item.quantity}</p>
                  </div>
                  <span className="font-extrabold text-primary dark:text-primary-glow">{item.totalPrice.toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white">
                <span>Tổng cộng:</span>
                <span className="text-primary dark:text-primary-glow">{cart.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
            >
              <ShieldCheck size={18} />
              <span>{loading ? 'Đang Xử Lý Đơn Hàng...' : 'Xác Nhận & Đặt Hàng'}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bảo mật giao dịch mã hóa 256-bit SSL</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
