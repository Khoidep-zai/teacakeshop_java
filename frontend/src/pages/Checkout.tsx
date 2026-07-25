import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Landmark, Smartphone, ShieldCheck } from 'lucide-react';
import { checkout } from '../api/orders';
import { cashOnDelivery, simulatePayment } from '../api/payments';
import { useCart } from '../hooks/useCart';

const PAYMENT_METHODS = [
  { id: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng (COD)', icon: Banknote },
  { id: 'MOMO_SIMULATION', label: 'Momo (Giả lập)', icon: Smartphone },
  { id: 'VNPAY_SIMULATION', label: 'VNPay (Giả lập)', icon: CreditCard },
  { id: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: Landmark },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, token, clearCart } = useCart();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !token) return;
    setLoading(true);

    try {
      const order = await checkout({
        cartToken: token,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        note: formData.note
      });

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        await cashOnDelivery({ orderCode: order.orderCode });
      } else {
        await simulatePayment({
          orderCode: order.orderCode,
          paymentMethod,
          purpose: 'FULL',
          amount: order.finalAmount || order.totalAmount
        });
      }

      await clearCart();
      navigate(`/orders/${order.orderCode}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Thanh toán không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-16 text-center dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">Khám phá sản phẩm</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8">Thanh toán đơn hàng</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Thông tin nhận hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                <input type="text" name="customerName" required value={formData.customerName} onChange={handleInputChange} className="input-field" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                <input type="tel" name="customerPhone" required value={formData.customerPhone} onChange={handleInputChange} className="input-field" placeholder="0901234567" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú đơn hàng</label>
              <textarea name="note" rows={3} value={formData.note} onChange={handleInputChange} className="input-field" placeholder="Ghi chú về đơn hàng hoặc địa chỉ giao hàng..."></textarea>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const selected = paymentMethod === pm.id;
                return (
                  <div key={pm.id} onClick={() => setPaymentMethod(pm.id)} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${selected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <Icon className={selected ? 'text-primary' : 'text-gray-400'} size={24} />
                    <span className="font-semibold text-sm">{pm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="card space-y-4 sticky top-28">
            <h2 className="text-xl font-bold pb-2 border-b dark:border-gray-700">Đơn hàng của bạn</h2>
            
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {cart.items.map(item => (
                <div key={item.id} className="pt-2 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold">{item.productName || item.comboName}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <span className="font-bold">{item.totalPrice.toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-xl font-extrabold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{cart.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2">
              <ShieldCheck size={20} />
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
