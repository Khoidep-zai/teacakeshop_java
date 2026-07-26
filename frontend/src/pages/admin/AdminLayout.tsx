import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Tags, Coffee, ShoppingCart, CalendarCheck, Users, Percent, Menu, X, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard AI', path: '/admin' },
  { icon: Coffee, label: 'Sản phẩm', path: '/admin/products' },
  { icon: Tags, label: 'Danh mục', path: '/admin/categories' },
  { icon: PackageSearch, label: 'Set Combo Pass', path: '/admin/combos' },
  { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
  { icon: CalendarCheck, label: 'Đặt bàn Lounge', path: '/admin/reservations' },
  { icon: Users, label: 'Người dùng', path: '/admin/users' },
  { icon: Percent, label: 'Mã khuyến mãi', path: '/admin/discounts' },
];

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 font-bold text-base text-white font-serif-title">
          🍵 TeaCake <span className="text-cyber-teal">Cyber Command</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div className="p-6 border-b border-slate-800 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-teal to-cyber-violet flex items-center justify-center text-white font-bold shadow-lg shadow-cyber-teal/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white font-serif-title leading-tight">Cyber Admin 2026</h1>
            <p className="text-[10px] text-cyber-teal font-extrabold tracking-wider uppercase">Lounge Operating System</p>
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
                  `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyber-teal to-cyber-violet text-white shadow-lg shadow-cyber-teal/20 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="truncate max-w-[110px]">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-400 p-1">
              <LogOut size={16} />
            </button>
          </div>
          <Link to="/" className="block text-center text-xs text-cyber-teal font-bold hover:underline">
            ← Quay về Giao Diện Khách Hàng
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
