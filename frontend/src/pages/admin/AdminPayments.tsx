import { useEffect, useState } from 'react';
import { CreditCard, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminPayments, markPaymentPaid } from '../../api/payments';
import type { Page, Payment } from '../../types';

const money = (value: number) => `${Number(value).toLocaleString('vi-VN')}₫`;

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const page = await getAdminPayments({ page: 0, size: 100 }) as Page<Payment>;
      setPayments(page.content || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tải giao dịch');
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const confirmCash = async (payment: Payment) => {
    if (!window.confirm(`Xác nhận đã nhận ${money(payment.amount)} cho giao dịch ${payment.transactionCode}?`)) return;
    try {
      await markPaymentPaid(payment.id);
      toast.success('Đã xác nhận thanh toán tiền mặt');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xác nhận thanh toán');
    }
  };

  const filtered = payments.filter(item => status === 'ALL' || item.status === status)
    .filter(item => `${item.transactionCode} ${item.orderCode}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6 max-w-7xl mx-auto">
    <header className="glass-card p-6"><p className="text-xs font-bold uppercase text-primary">Dữ liệu giao dịch backend</p>
      <h1 className="text-3xl font-extrabold flex gap-3 items-center"><CreditCard /> Quản lý thanh toán</h1></header>
    <div className="glass-card p-4 flex gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-3.5 w-4" />
        <input className="input-field pl-10" placeholder="Mã thanh toán hoặc mã đơn" value={search}
          onChange={e => setSearch(e.target.value)} /></div>
      <select className="input-field w-44" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="ALL">Mọi trạng thái</option><option value="PENDING">Chờ thanh toán</option>
        <option value="PAID">Đã thanh toán</option><option value="FAILED">Thất bại</option><option value="REFUNDED">Đã hoàn</option>
      </select>
    </div>
    <div className="glass-card overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="text-left border-b"><th className="p-4">Giao dịch</th><th>Đơn hàng</th>
        <th>Mục đích / phương thức</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th><th></th></tr></thead>
      <tbody>{filtered.map(item => <tr key={item.id} className="border-b last:border-0">
        <td className="p-4 font-mono font-bold">{item.transactionCode}</td><td>{item.orderCode}</td>
        <td>{item.purpose}<br /><small>{item.paymentMethod}</small></td>
        <td><b>{money(item.amount)}</b><br /><small>Còn {money(item.outstandingAmount)}</small></td>
        <td>{item.status}</td><td>{new Date(item.paidAt || item.createdAt).toLocaleString('vi-VN')}</td>
        <td className="pr-4">{item.paymentMethod === 'CASH_ON_DELIVERY' && item.status === 'PENDING' &&
          <button className="btn-primary" onClick={() => void confirmCash(item)}>Xác nhận đã thu</button>}</td>
      </tr>)}
      {!loading && !filtered.length && <tr><td colSpan={7} className="p-10 text-center text-slate-500">Không có giao dịch phù hợp</td></tr>}
      </tbody>
    </table></div>
  </div>;
}
