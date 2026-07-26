import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Landmark, Smartphone, ShieldCheck, Sparkles, Lock, MapPin, Clock, AlertCircle, TicketPercent } from 'lucide-react';
import { checkout } from '../api/orders';
import { previewVoucher } from '../api/discounts';
import { simulatePayment, cashOnDelivery } from '../api/payments';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import type { OrderType, Order, VoucherPreview } from '../types';

// COD chỉ áp dụng cho đơn NORMAL (giao hàng tận nơi)
const ALL_PAYMENT_METHODS = [
  { id: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng (COD)', icon: Banknote, onlyNormal: true },
  { id: 'MOMO_SIMULATION', label: 'Mô phỏng ví MoMo', icon: Smartphone, onlyNormal: false },
  { id: 'VNPAY_SIMULATION', label: 'Mô phỏng VNPay', icon: CreditCard, onlyNormal: false },
  { id: 'BANK_TRANSFER', label: 'Mô phỏng chuyển khoản ngân hàng', icon: Landmark, onlyNormal: false },
];

const ORDER_TYPES: { id: OrderType; label: string }[] = [
  { id: 'NORMAL', label: 'Giao hàng tận nơi' },
  { id: 'TAKEAWAY_PREORDER', label: 'Đặt trước - Tự lấy' },
  { id: 'RESERVATION_COMBO', label: 'Kết hợp đặt bàn' },
];

// Bước thanh toán cọc riêng cho RESERVATION_COMBO và TAKEAWAY_PREORDER
interface DepositStepProps {
  order: Order;
  paymentMethod: string;
  customerPhone: string;
  onSuccess: () => void;
}

function DepositStep({ order, paymentMethod, customerPhone, onSuccess }: DepositStepProps) {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);

  const depositAmount = order.depositAmount ?? 0;

  const handlePayDeposit = async () => {
    setPaying(true);
    try {
      await simulatePayment({
        orderId: order.id,
        customerPhone,
        paymentMethod,
        purpose: 'DEPOSIT',
      });
      toast.success('Thanh toán cọc thành công! ✨', {
        style: { borderRadius: '20px', background: '#0F172A', color: '#fff' },
      });
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Thanh toán cọc thất bại. Vui lòng thử lại.';
      toast.error(msg, { style: { borderRadius: '20px' } });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto min-h-screen flex flex-col justify-center">
      <div className="glass-card p-8 space-y-6 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif-title">Thanh Toán Tiền Cọc</h2>
          <p className="text-xs text-slate-500 mt-1">Mã đơn: <span className="font-mono font-bold text-primary">{order.orderCode}</span></p>
        </div>

        <div className="bg-slate-100/80 dark:bg-slate-800/80 p-4 rounded-2xl space-y-2 text-sm border border-slate-200 dark:border-slate-700 text-left">
          <div className="flex justify-between">
            <span className="text-slate-500">Tổng đơn hàng:</span>
            <span className="font-bold">{(order.totalAmount ?? 0).toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-extrabold border-t pt-2 dark:border-slate-700">
            <span>Tiền cọc do hệ thống xác định:</span>
            <span>{depositAmount.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between text-slate-400 text-xs">
            <span>Phần còn lại (trả khi đến):</span>
            <span>{(order.remainingAmount ?? 0).toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-3 text-xs text-left">
          <p className="font-bold text-primary dark:text-primary-glow mb-1">Phương thức: {paymentMethod.replace('_SIMULATION', '').replace('_', ' ')}</p>
          <p className="text-slate-500">Sau khi xác nhận thanh toán cọc, bạn sẽ được chuyển đến bước đặt bàn để hoàn tất lịch hẹn.</p>
        </div>

        <button
          onClick={handlePayDeposit}
          disabled={paying}
          className="w-full btn-primary py-4 text-sm font-extrabold shadow-lg"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{paying ? 'Đang xử lý...' : `Xác Nhận Thanh Toán Cọc ${depositAmount.toLocaleString('vi-VN')}₫`}</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Hủy và quay về trang chủ
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, token, clearCart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    shippingAddress: '',
    note: '',
  });
  const [orderType, setOrderType] = useState<OrderType>('NORMAL');
  const [paymentMethod, setPaymentMethod] = useState('MOMO_SIMULATION');
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherPreview | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Sau khi checkout xong, nếu cần cọc thì hiện màn hình cọc
  const [pendingDepositOrder, setPendingDepositOrder] = useState<Order | null>(null);

  // Lọc phương thức thanh toán: COD chỉ cho NORMAL
  const availablePaymentMethods = ALL_PAYMENT_METHODS.filter(
    pm => orderType === 'NORMAL' || !pm.onlyNormal
  );

  // Nếu orderType thay đổi và COD đang được chọn nhưng không còn hợp lệ, reset
  const handleOrderTypeChange = (newType: OrderType) => {
    setOrderType(newType);
    setAppliedVoucher(null);
    if (newType !== 'NORMAL' && paymentMethod === 'CASH_ON_DELIVERY') {
      setPaymentMethod('MOMO_SIMULATION');
    }
  };

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã voucher.');
      return;
    }
    setApplyingVoucher(true);
    try {
      const result = await previewVoucher(code, cart?.totalAmount ?? 0, orderType);
      setVoucherCode(result.code);
      setAppliedVoucher(result);
      toast.success(`Áp dụng ${result.code} thành công.`);
    } catch (err: any) {
      setAppliedVoucher(null);
      toast.error(err?.response?.data?.message || 'Voucher không hợp lệ.');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !token) {
      toast.error('Giỏ hàng không hợp lệ. Vui lòng thử lại.');
      return;
    }
    if (!formData.customerName.trim()) { toast.error('Vui lòng nhập họ và tên.'); return; }
    if (!formData.customerPhone.trim()) { toast.error('Vui lòng nhập số điện thoại.'); return; }
    if (!formData.customerEmail.trim()) { toast.error('Vui lòng nhập email.'); return; }
    if (orderType === 'NORMAL' && !formData.shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng cho đơn giao tận nơi.'); return;
    }
    if ((orderType === 'TAKEAWAY_PREORDER' || orderType === 'RESERVATION_COMBO') && !pickupTime) {
      toast.error('Vui lòng chọn thời gian nhận hàng (ít nhất 2 giờ sau hiện tại).'); return;
    }
    if ((orderType === 'TAKEAWAY_PREORDER' || orderType === 'RESERVATION_COMBO') && pickupTime) {
      const pt = new Date(pickupTime);
      const minTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
      if (pt < minTime) { toast.error('Thời gian nhận hàng phải cách hiện tại ít nhất 2 giờ.'); return; }
    }

    setLoading(true);
    try {
      const order = await checkout({
        cartToken: token,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        shippingAddress: formData.shippingAddress.trim() || null,
        orderType,
        pickupTime: pickupTime || null,
        voucherCode: voucherCode.trim() || null,
        note: formData.note.trim() || null,
      });

      await clearCart();

      // Đơn NORMAL + COD: tạo COD payment rồi chuyển sang order tracking
      if (orderType === 'NORMAL') {
        if (paymentMethod === 'CASH_ON_DELIVERY') {
          try {
            await cashOnDelivery({ orderId: order.id, customerPhone: formData.customerPhone.trim(), note: formData.note.trim() || undefined });
          } catch (payErr: any) {
            toast.error(payErr?.response?.data?.message || 'Đơn đã tạo nhưng không thể khởi tạo thanh toán COD.');
            navigate(`/orders/${order.orderCode}?phone=${encodeURIComponent(formData.customerPhone)}&payment=failed`);
            return;
          }
        } else {
          try {
            await simulatePayment({ orderId: order.id, customerPhone: formData.customerPhone.trim(), paymentMethod, purpose: 'FULL' });
          } catch (payErr: any) {
            toast.error(payErr?.response?.data?.message || 'Đơn đã tạo nhưng giao dịch thanh toán thất bại.');
            navigate(`/orders/${order.orderCode}?phone=${encodeURIComponent(formData.customerPhone)}&payment=failed`);
            return;
          }
        }
        toast.success('Đặt hàng thành công! ✨', {
          style: { borderRadius: '20px', background: '#0F172A', color: '#fff' },
        });
        navigate(`/orders/${order?.orderCode}?phone=${encodeURIComponent(formData.customerPhone)}`);
        return;
      }

      // Đơn TAKEAWAY_PREORDER / RESERVATION_COMBO: dùng mức cọc backend trả về.
      // Hiển thị màn hình thanh toán cọc riêng biệt (TC10 bước 5-6)
      toast.success('Đơn hàng đã tạo! Vui lòng thanh toán mức cọc hệ thống yêu cầu.', {
        style: { borderRadius: '20px', background: '#0F172A', color: '#fff' },
        duration: 4000,
      });
      setPendingDepositOrder(order);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.';
      toast.error(msg, { style: { borderRadius: '20px' } });
      if (/tồn kho|chỉ còn|ngừng bán|hết hạn|giỏ hàng/i.test(msg)) {
        await refreshCart();
      }
    } finally {
      setLoading(false);
    }
  };

  // Sau khi thanh toán cọc thành công
  const handleDepositSuccess = () => {
    if (!pendingDepositOrder) return;
    const phone = encodeURIComponent(formData.customerPhone);
    if (orderType === 'RESERVATION_COMBO') {
      // TC10 bước 8: chuyển sang form đặt bàn
      navigate(
        `/reservation?orderId=${pendingDepositOrder.id}&phone=${phone}&orderCode=${pendingDepositOrder.orderCode}&pickupTime=${encodeURIComponent(pendingDepositOrder.pickupTime || '')}`
      );
    } else {
      // TAKEAWAY_PREORDER: chuyển về order tracking
      navigate(`/orders/${pendingDepositOrder.orderCode}?phone=${phone}`);
    }
  };

  // Hiển thị màn hình thanh toán cọc (TC10 bước 5)
  if (pendingDepositOrder) {
    return (
      <DepositStep
        order={pendingDepositOrder}
        paymentMethod={paymentMethod}
        customerPhone={formData.customerPhone.trim()}
        onSuccess={handleDepositSuccess}
      />
    );
  }

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
        <div className="lg:w-2/3 space-y-6">

          {/* 1. Loại đơn */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title border-b border-slate-200 dark:border-slate-800 pb-3">
              1. Loại Đơn Hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ORDER_TYPES.map((ot) => {
                const selected = orderType === ot.id;
                return (
                  <div key={ot.id} onClick={() => handleOrderTypeChange(ot.id)}
                    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-3 transition-all border ${
                      selected ? 'bg-slate-900 text-white border-cyber-teal shadow-lg shadow-cyber-teal/20 scale-[1.02]'
                        : 'bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                    <span className="font-bold text-xs">{ot.label}</span>
                  </div>
                );
              })}
            </div>
            {(orderType === 'RESERVATION_COMBO' || orderType === 'TAKEAWAY_PREORDER') && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-500/30 rounded-2xl p-3 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-amber-700 dark:text-amber-300 font-semibold">
                  Mức tiền cọc chính xác sẽ do hệ thống tính sau khi tạo đơn.
                  {orderType === 'RESERVATION_COMBO' && ' Sau đó bạn sẽ được chuyển đến form đặt bàn.'}
                </span>
              </div>
            )}
          </div>

          {/* 2. Thông tin nhận hàng */}
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
                  <MapPin className="inline w-3.5 h-3.5 mr-1" />Địa Chỉ Giao Hàng *
                </label>
                <input type="text" name="shippingAddress" required={orderType === 'NORMAL'} value={formData.shippingAddress} onChange={handleInputChange} className="input-field text-xs" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..." />
              </div>
            )}
            {(orderType === 'TAKEAWAY_PREORDER' || orderType === 'RESERVATION_COMBO') && (
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  <Clock className="inline w-3.5 h-3.5 mr-1" />
                  {orderType === 'RESERVATION_COMBO' ? 'Thời Gian Đến Dùng Bàn *' : 'Thời Gian Đến Lấy Hàng *'}
                  <span className="ml-1 text-slate-400 font-normal">(tối thiểu 2 giờ kể từ bây giờ)</span>
                </label>
                <input type="datetime-local" required value={pickupTime} onChange={e => setPickupTime(e.target.value)} min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)} className="input-field text-xs" />
              </div>
            )}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">Ghi Chú Thêm</label>
              <textarea name="note" rows={3} value={formData.note} onChange={handleInputChange} className="input-field text-xs" placeholder="Ghi chú đặc biệt (ít ngọt, không đá, dị ứng...)"></textarea>
            </div>
          </div>

          {/* 3. Phương thức thanh toán */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title border-b border-slate-200 dark:border-slate-800 pb-3">
              3. Phương Thức Thanh Toán
            </h2>
            {orderType !== 'NORMAL' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-300/30">
                ⚠️ Thanh toán khi nhận hàng (COD) không khả dụng cho đơn đặt trước và đặt bàn.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availablePaymentMethods.map((pm) => {
                const Icon = pm.icon;
                const selected = paymentMethod === pm.id;
                return (
                  <div key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-3 transition-all border ${
                      selected ? 'bg-slate-900 text-white border-cyber-teal shadow-lg shadow-cyber-teal/20 scale-[1.02]'
                        : 'bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                    <Icon className={selected ? 'text-cyber-teal' : 'text-slate-400'} size={20} />
                    <span className="font-bold text-xs">{pm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-1/3">
          <div className="glass-card-static p-6 sticky top-28 space-y-4">
            <h2 className="text-xl font-bold font-serif-title pb-3 border-b border-slate-200 dark:border-slate-800">Đơn Hàng Của Bạn</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="pt-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.productName || item.comboName}</p>
                    <p className="text-[11px] text-slate-400">x{item.quantity}</p>
                  </div>
                  <span className="font-extrabold text-primary dark:text-primary-glow">{item.totalPrice.toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="space-y-2 pb-3">
                <label className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <TicketPercent size={15} className="text-primary" /> Mã voucher
                </label>
                <div className="flex gap-2">
                  <input
                    value={voucherCode}
                    onChange={event => {
                      setVoucherCode(event.target.value.toUpperCase());
                      setAppliedVoucher(null);
                    }}
                    className="input-field text-xs min-w-0"
                    placeholder="Ví dụ: WELCOME10"
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => void handleApplyVoucher()}
                    disabled={applyingVoucher}
                    className="btn-secondary px-3 text-xs whitespace-nowrap"
                  >
                    {applyingVoucher ? 'Đang kiểm tra' : 'Áp dụng'}
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <b>{appliedVoucher.code}</b> — giảm {appliedVoucher.discountAmount.toLocaleString('vi-VN')}₫
                  </div>
                )}
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white">
                <span>Tổng cộng:</span>
                <span className="text-primary dark:text-primary-glow">
                  {(appliedVoucher?.finalAmount ?? cart.totalAmount).toLocaleString('vi-VN')}₫
                </span>
              </div>
              {(orderType === 'RESERVATION_COMBO' || orderType === 'TAKEAWAY_PREORDER') && (
                <div className="flex justify-between text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl">
                  <span>Tiền cọc:</span>
                  <span>Hệ thống sẽ tính chính xác sau khi tạo đơn</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg">
              <ShieldCheck size={18} />
              <span>{loading ? 'Đang Xử Lý...' : 'Xác Nhận & Đặt Hàng'}</span>
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
