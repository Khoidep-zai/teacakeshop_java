import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Tags, Coffee, ShoppingCart, CalendarCheck, Users, Percent, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Coffee, label: 'Sản phẩm', path: '/admin/products' },
  { icon: Tags, label: 'Danh mục', path: '/admin/categories' },
  { icon: PackageSearch, label: 'Combo', path: '/admin/combos' },
  { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
  { icon: CalendarCheck, label: 'Đặt bàn', path: '/admin/reservations' },
  { icon: Users, label: 'Người dùng', path: '/admin/users' },
  { icon: Percent, label: 'Khuyến mãi', path: '/admin/discounts' },
];

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
          🍵 TeaCake <span className="text-accent">Admin</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 hidden md:flex items-center gap-2">
          <div className="bg-accent text-white p-2 rounded-xl text-lg">⚙️</div>
          <div>
            <h1 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">Admin Portal</h1>
            <p className="text-xs text-gray-500">Tea & Cake Management</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="truncate max-w-[110px]">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 p-1">
              <LogOut size={16} />
            </button>
          </div>
          <Link to="/" className="block text-center text-xs text-primary font-semibold hover:underline">
            ← Trở về trang khách hàng
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
