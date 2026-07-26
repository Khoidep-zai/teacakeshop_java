import { DollarSign, ShoppingCart, Users, Coffee, TrendingUp, AlertCircle, FileSpreadsheet, Sparkles, PieChart as PieIcon, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

// 1. Line Chart Data (Doanh thu 7 ngày)
const weeklyRevenueData = [
  { name: 'Thứ 2', revenue: 4200000, orders: 48 },
  { name: 'Thứ 3', revenue: 3800000, orders: 42 },
  { name: 'Thứ 4', revenue: 5500000, orders: 61 },
  { name: 'Thứ 5', revenue: 4900000, orders: 53 },
  { name: 'Thứ 6', revenue: 7800000, orders: 89 },
  { name: 'Thứ 7', revenue: 10500000, orders: 124 },
  { name: 'Chủ Nhật', revenue: 12800000, orders: 145 },
];

// 2. Bar Chart Data (Doanh số theo danh mục)
const categorySalesData = [
  { category: 'Bánh ngọt Pháp', sales: 18500000, items: 245 },
  { category: 'Trà Ủ Lạnh Cold Brew', sales: 15200000, items: 310 },
  { category: 'Set Combo Pass Hoàng Gia', sales: 15800000, items: 115 },
];

// 3. Pie Chart Data (Cơ cấu doanh thu %)
const revenueShareData = [
  { name: 'Bánh ngọt Pháp', value: 37.4, color: '#E76F51' },
  { name: 'Trà Ủ Lạnh Cold Brew', value: 30.7, color: '#2D6A4F' },
  { name: 'Set Combo Pass', value: 31.9, color: '#06B6D4' },
];

// Excel Export Handler (Format CSV with UTF-8 BOM for Microsoft Excel compatibility)
const handleExportExcel = () => {
  const headers = ['Mã Đơn', 'Tên Sản Phẩm', 'Danh Mục', 'Số Lượng Bán', 'Đơn Giá (VNĐ)', 'Doanh Thu (VNĐ)', 'Trạng Thái'];
  const rows = [
    ['HD-2026-001', 'Bánh Matcha Mousse Layered 2026', 'Bánh ngọt Pháp', '324', '75,000', '24,300,000', 'Đã Hoàn Thành'],
    ['HD-2026-002', 'Bánh Earl Grey Chiffon Lavender', 'Bánh ngọt Pháp', '210', '82,000', '17,220,000', 'Đã Hoàn Thành'],
    ['HD-2026-003', 'Trà Sakura Lychee Rose Ủ Lạnh', 'Trà Ủ Lạnh', '310', '68,000', '21,080,000', 'Đã Hoàn Thành'],
    ['HD-2026-004', 'Trà Oolong Kim Tuyên Hoàng Gia', 'Trà Ủ Lạnh', '280', '65,000', '18,200,000', 'Đã Hoàn Thành'],
    ['HD-2026-005', 'Set Trà Chiều Royal Afternoon Tea Pass', 'Set Combo Pass', '115', '135,000', '15,525,000', 'Đã Hoàn Thành'],
  ];

  const csvContent = '\uFEFF' + [
    ['BÁO CÁO THỐNG KÊ DOANH THU & SẢN PHẨM — TEA & CAKE LOUNGE 2026'],
    ['Ngày xuất báo cáo:', new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN')],
    [''],
    headers,
    ...rows,
    [''],
    ['TỔNG DOANH THU TÍNH TOÁN:', '', '', '', '', '96,325,000 VNĐ', '']
  ].map(e => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Doanh_Thu_TeaCake_Lounge_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Đã xuất báo cáo Excel (CSV) hoàn chỉnh cho dân văn phòng! 📊', {
    style: { borderRadius: '20px', background: '#0F172A', color: '#fff' }
  });
};

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title & Excel Export Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Hệ Thống Thống Kê & Phân Tích Doanh Thu 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Báo Cáo Tổng Quan Doanh Nghiệp
          </h1>
        </div>

        <button
          onClick={handleExportExcel}
          className="btn-accent px-5 py-3 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel (XLSX / CSV)</span>
        </button>
      </div>

      {/* Stats Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif-title mt-0.5">49.500.000₫</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2% so với tuần trước
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-sky-500">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif-title mt-0.5">1.245 Đơn</h3>
            <p className="text-xs text-sky-600 dark:text-sky-400 font-bold flex items-center mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8.5% đơn hoàn tất
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Khách Hàng Đã Đăng Ký</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif-title mt-0.5">8.549 Thành Viên</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +120 khách mới/tuần
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng Danh Mục Món</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif-title mt-0.5">124 Món</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Phân bổ 3 danh mục chính</p>
          </div>
        </div>
      </div>

      {/* Chart Section 1: Line Chart (Doanh thu tuần) & Pie Chart (Tỷ lệ cơ cấu) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-serif-title flex items-center gap-2">
              <LineIcon className="w-5 h-5 text-accent" />
              <span>Biểu Đồ Xu Hướng Doanh Thu (7 Ngày Gần Nhất)</span>
            </h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyRevenueData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip formatter={(val: number) => [`${val.toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
                <Line type="monotone" dataKey="revenue" stroke="#E76F51" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie / Doughnut Chart */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-serif-title flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-primary" />
            <span>Tỷ Lệ Cơ Cấu Doanh Thu</span>
          </h2>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueShareData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {revenueShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val}%`, 'Tỷ lệ đóng góp']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-bold">
            Bánh ngọt Pháp chiếm tỷ trọng cao nhất (37.4%)
          </div>
        </div>

      </div>

      {/* Chart Section 2: Bar Chart (Doanh số danh mục) */}
      <div className="glass-card p-6">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-serif-title flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-cyber-teal" />
          <span>Biểu Đồ Cột So Sánh Doanh Số Theo Danh Mục Sản Phẩm</span>
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySalesData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}M`} />
              <Tooltip formatter={(val: number) => [`${val.toLocaleString('vi-VN')} ₫`, 'Doanh số']} />
              <Bar dataKey="sales" fill="#2D6A4F" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables: Top Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Selling Products */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-serif-title">
              Top Sản Phẩm Bán Chạy Nhất
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-extrabold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Tên Món</th>
                  <th className="px-6 py-3">Đã Bán</th>
                  <th className="px-6 py-3">Doanh Thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: 'Bánh Matcha Mousse Layered 2026', count: 324, price: 75000 },
                  { name: 'Trà Sakura Lychee Rose Ủ Lạnh', count: 310, price: 68000 },
                  { name: 'Trà Oolong Kim Tuyên Hoàng Gia', count: 280, price: 65000 },
                  { name: 'Bánh Earl Grey Chiffon Lavender', count: 210, price: 82000 },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 font-semibold">{item.count} phần</td>
                    <td className="px-6 py-4 font-extrabold text-primary">{(item.count * item.price).toLocaleString('vi-VN')}₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-serif-title flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Cảnh Báo Sắp Hết Hàng Trong Kho</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-extrabold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Tên Nguyên Liệu / Món</th>
                  <th className="px-6 py-3">Danh Mục</th>
                  <th className="px-6 py-3">Tồn Kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: 'Lá Trà Earl Grey Nguyên Chất', cat: 'Nguyên Liệu', count: 3 },
                  { name: 'Bơ Pháp Cao Cấp AOP', cat: 'Nguyên Liệu Bánh', count: 5 },
                  { name: 'Hoa Anh Đào Khô Nhật Bản', cat: 'Nguyên Liệu Trà', count: 4 },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4">{item.cat}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">
                        Còn lại {item.count} đơn vị
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
