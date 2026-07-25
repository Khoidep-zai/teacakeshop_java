import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, XCircle, ChevronLeft, User, FileText, ShoppingBag } from 'lucide-react';
import { getOrder } from '../api/orders';
import type { Order } from '../types';

const statuses = [
  { id: 'PENDING', label: 'Chờ xử lý', icon: FileText, description: 'Đơn hàng đã được ghi nhận' },
  { id: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle, description: 'Cửa hàng đã xác nhận đơn' },
  { id: 'PREPARING', label: 'Đang chuẩn bị', icon: Package, description: 'Đang chuẩn bị trà và bánh' },
  { id: 'COMPLETED', label: 'Hoàn thành', icon: ShoppingBag, description: 'Đơn hàng đã hoàn thành' },
];

export default function OrderTracking() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderCode) return;
    getOrder(orderCode)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Không tìm thấy thông tin đơn hàng');
        setLoading(false);
      });
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Mã đơn hàng không hợp lệ'}</p>
        <Link to="/" className="btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  const currentStepIndex = statuses.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/profile" className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary">
          <ChevronLeft className="w-4 h-4 mr-1" /> Trở về lịch sử
        </Link>

        {/* Order Info Card */}
        <div className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đơn hàng #{order.orderCode}</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                isCancelled ? 'bg-red-100 text-red-700' : 'bg-primary/20 text-primary'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Thành tiền</p>
            <p className="text-2xl font-extrabold text-primary">{(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')}₫</p>
          </div>
        </div>

        {/* Status Stepper */}
        {!isCancelled ? (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Trạng thái đơn hàng</h2>
            <div className="relative flex flex-col md:flex-row justify-between gap-6">
              {statuses.map((s, index) => {
                const Icon = s.icon;
                const isDone = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;

                return (
                  <div key={s.id} className="flex md:flex-col items-center flex-1 gap-4 md:gap-2 text-left md:text-center z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      isDone ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isCurrent ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">Đơn hàng đã bị hủy</p>
              <p className="text-sm text-red-600 dark:text-red-300">Nếu có thắc mắc, xin liên hệ bộ phận hỗ trợ khách hàng.</p>
            </div>
          </div>
        )}

        {/* Order Summary & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết sản phẩm</h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center font-bold text-gray-500">
                      ☕
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity} - {item.unitPrice.toLocaleString('vi-VN')}₫</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{item.totalPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin giao hàng</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>{order.customerName || 'Khách hàng'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{order.customerPhone || 'N/A'}</span>
              </div>
              {order.note && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                  <strong>Ghi chú:</strong> {order.note}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
