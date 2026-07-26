import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Tags, Coffee, ShoppingCart, CalendarCheck, Users, Percent, CreditCard, Boxes, Menu, X, LogOut, Sparkles, Sun, Moon, Globe, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const sidebarItems = [
  { icon: LayoutDashboard, labelKey: 'Dashboard AI (Thống kê)', path: '/admin' },
  { icon: Coffee, labelKey: 'Sản Phẩm (Bánh & Trà)', path: '/admin/products' },
  { icon: Tags, labelKey: 'Danh Mục Món', path: '/admin/categories' },
  { icon: PackageSearch, labelKey: 'Set Combo Pass', path: '/admin/combos' },
  { icon: ShoppingCart, labelKey: 'Đơn Hàng', path: '/admin/orders' },
  { icon: CalendarCheck, labelKey: 'Đặt Bàn Lounge', path: '/admin/reservations' },
  { icon: Users, labelKey: 'Quản Lý Người Dùng', path: '/admin/users' },
  { icon: Percent, labelKey: 'Mã Khuyến Mãi (Voucher)', path: '/admin/discounts' },
  { icon: CreditCard, labelKey: 'Quản Lý Thanh Toán', path: '/admin/payments' },
  { icon: Boxes, labelKey: 'Theo Dõi Tồn Kho', path: '/admin/inventory' },
];

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
    toast.success(`Đã chuyển ngôn ngữ sang ${nextLang.toUpperCase()} 🌐`);
  };

  const activeItem = sidebarItems.find(item => item.path === location.pathname) || sidebarItems[0];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-300">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 font-black text-base text-slate-900 dark:text-white font-serif-title">
          🍵 TeaCake <span className="text-primary font-sans text-xs">Admin Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1">
            <Globe size={14} />
            <span>{i18n.language.toUpperCase()}</span>
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-300">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-700 dark:text-slate-300">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-xl md:shadow-none`}>
        
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 dark:text-white font-serif-title leading-tight">Cyber Admin 2026</h1>
            <p className="text-[10px] text-primary dark:text-cyber-teal font-extrabold tracking-wider uppercase">Lounge Executive System</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-primary dark:text-white shadow-md scale-[1.01]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.labelKey}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="truncate max-w-[110px]">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'Quản Trị Viên'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@teacakeshop.com'}</p>
              </div>
            </div>
            <button onClick={logout} title="Đăng xuất" className="text-slate-400 hover:text-red-500 p-1">
              <LogOut size={16} />
            </button>
          </div>

          <Link to="/" className="block text-center text-xs text-primary dark:text-cyber-teal font-extrabold hover:underline">
            ← Quay về Giao Diện Khách Hàng
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Header Control Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span>Bảng Quản Trị</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-extrabold">{activeItem.labelKey}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Đổi ngôn ngữ Tiếng Việt / Tiếng Anh"
            >
              <Globe size={14} className="text-primary" />
              <span>{i18n.language === 'vi' ? '🇻🇳 Tiếng Việt (VI)' : '🇬🇧 English (EN)'}</span>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Chuyển chế độ Sáng / Tối"
            >
              {darkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-600" />}
              <span>{darkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
