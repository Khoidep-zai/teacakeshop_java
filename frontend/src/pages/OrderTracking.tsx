import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, XCircle, ChevronLeft, User, FileText, ShoppingBag, Sparkles, Phone } from 'lucide-react';
import { getOrder } from '../api/orders';
import { useAuth } from '../hooks/useAuth';
import type { Order } from '../types';

const statuses = [
  { id: 'PENDING', label: 'Tiếp nhận đơn', icon: FileText, description: 'Đơn hàng đã được ghi nhận trên hệ thống' },
  { id: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle, description: 'Barista & Pastry Chef đã nhận đơn' },
  { id: 'PREPARING', label: 'Đang chế tác', icon: Package, description: 'Ủ trà hữu cơ & đóng gói bánh tươi' },
  { id: 'COMPLETED', label: 'Giao hoàn thành', icon: ShoppingBag, description: 'Đã giao tới tay khách hàng' },
];

// Helper: lấy itemName an toàn từ OrderItem (hỗ trợ cả 2 field name)
const getItemName = (item: any): string => item.itemName || item.name || 'Sản phẩm';
const getItemTotal = (item: any): number => item.lineTotal ?? item.totalPrice ?? 0;

export default function OrderTracking() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState('');
  const [needPhone, setNeedPhone] = useState(false);
  const [error, setError] = useState('');

  // Phone từ URL query param (?phone=...) - được set sau khi checkout
  const phoneFromUrl = searchParams.get('phone') || '';

  const fetchOrder = async (phone: string) => {
    if (!orderCode || !phone) return;
    setLoading(true);
    setError('');
    try {
      const data = await getOrder(orderCode, phone);
      if (data && data.orderCode) {
        setOrder(data);
      } else {
        setError('Không tìm thấy đơn hàng với thông tin này.');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.');
      } else {
        setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderCode) return;

    if (phoneFromUrl) {
      // Phone có sẵn từ URL (vừa checkout xong)
      fetchOrder(phoneFromUrl);
    } else if (user?.phone) {
      // User đã đăng nhập, thử dùng phone của user
      fetchOrder(user.phone);
    } else {
      // Cần nhập phone
      setNeedPhone(true);
      setLoading(false);
    }
  }, [orderCode, phoneFromUrl]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setNeedPhone(false);
    fetchOrder(phoneInput.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Cần nhập phone
  if (needPhone) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <Phone className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif-title">Xác Nhận Đơn Hàng</h2>
            <p className="text-xs text-slate-400 mt-2">Nhập số điện thoại đặt hàng để tra cứu đơn #{orderCode}</p>
          </div>
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="input-field text-sm"
              placeholder="Nhập số điện thoại đặt hàng..."
              required
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button type="submit" className="w-full btn-primary py-3 text-xs font-extrabold">
              Tra Cứu Đơn Hàng
            </button>
          </form>
          <Link to="/" className="block text-center text-xs text-slate-400 hover:text-primary transition-colors">
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  // Lỗi sau khi đã có phone
  if (error && !order) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4 gap-4">
        <XCircle className="w-14 h-14 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif-title">{error}</h2>
        <div className="flex gap-3">
          <button onClick={() => { setNeedPhone(true); setError(''); }} className="btn-secondary text-xs px-4 py-2">
            Thử lại
          </button>
          <Link to="/" className="btn-primary text-xs px-6 py-2.5">Về Trang Chủ</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <XCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif-title mb-2">Không tìm thấy đơn hàng</h2>
        <Link to="/" className="btn-primary text-xs px-6 py-2.5">Về Trang Chủ</Link>
      </div>
    );
  }

  const currentStepIndex = statuses.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      <Link to="/profile" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-primary transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Trở về lịch sử đơn hàng
      </Link>

      {/* Header Info */}
      <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
              Đơn Hàng #{order.orderCode}
            </h1>
            <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
              isCancelled ? 'bg-red-500/10 text-red-500' : 'bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/30'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Khởi tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        
        <div className="text-left md:text-right">
          <p className="text-xs text-slate-400 font-semibold uppercase">Tổng giá trị đơn</p>
          <p className="text-2xl font-black text-primary dark:text-primary-glow font-serif-title">
            {(order.finalAmount ?? order.totalAmount).toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>

      {/* Timeline Stepper */}
      {!isCancelled ? (
        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 text-primary font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Tiến Trình Chế Tác & Giao Hàng</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            {statuses.map((s, index) => {
              const Icon = s.icon;
              const isDone = currentStepIndex >= index;
              const isCurrent = currentStepIndex === index;

              return (
                <div key={s.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 text-left sm:text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    isDone
                      ? 'bg-slate-900 text-white shadow-lg shadow-cyber-teal/20 border border-cyber-teal/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className={`w-5 h-5 ${isCurrent ? 'text-cyber-teal animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${isCurrent ? 'text-cyber-teal' : 'text-slate-800 dark:text-slate-200'}`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 bg-red-500/10 border-red-500/30 flex items-center gap-4">
          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-500 text-sm">Đơn hàng đã được hủy</p>
            <p className="text-xs text-slate-400">Nếu cần hỗ trợ thêm, vui lòng liên hệ hotline 24/7 của Lounge.</p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title">Chi Tiết Món Đã Đặt</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-base">
                    🍵
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{getItemName(item)}</p>
                    <p className="text-slate-400">Số lượng: x{item.quantity} - {item.unitPrice.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
                <p className="font-extrabold text-slate-900 dark:text-white">{getItemTotal(item).toLocaleString('vi-VN')}₫</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif-title">Người Nhận Hàng</h2>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-bold">{order.customerName || 'Khách hàng'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>SĐT: {order.customerPhone || 'N/A'}</span>
            </div>
            {order.shippingAddress && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                <strong className="block text-slate-400 mb-0.5">Địa chỉ giao hàng:</strong> {order.shippingAddress}
              </div>
            )}
            {order.note && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                <strong className="block text-slate-400 mb-0.5">Ghi chú:</strong> {order.note}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
