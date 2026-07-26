import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, Moon, Sun, Globe, Sparkles, Menu, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const navLinks = [
    { path: '/', label: t('nav.home', 'Trang chủ') },
    { path: '/products', label: t('nav.products', 'Sản phẩm') },
    { path: '/combos', label: t('nav.combos', 'Combo Chiều') },
    { path: '/reservation', label: t('nav.reservation', 'Đặt bàn Lounge') },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 rounded-3xl shadow-glass dark:shadow-glass-dark px-4 sm:px-6 py-2.5 transition-all duration-300">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold shadow-md shadow-primary/20 group-hover:scale-105 group-hover:shadow-glow-primary transition-all duration-300">
              <span>🍵</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-teal rounded-full animate-ping opacity-75" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-serif-title leading-tight">
                Tea&Cake <span className="gradient-text-matcha">Lounge</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyber-teal" /> Cyber-Organic 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/60 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-700/40">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-primary dark:text-primary-glow shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-accent text-white shadow-md'
                    : 'text-accent hover:bg-accent/10'
                }`}
              >
                {user.role === 'ADMIN' ? t('nav.admin', 'Quản trị') : '⚙️ Quản lý'}
              </Link>
            )}
          </nav>

          {/* Actions & Toggles */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title={t('language', 'Đổi ngôn ngữ')}
            >
              <Globe className="w-4 h-4 text-primary" />
              <span className="uppercase">{i18n.language || 'vi'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
              title={t('theme', 'Đổi giao diện')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-2xl bg-primary/10 text-primary dark:bg-primary-glow/10 dark:text-primary-glow hover:bg-primary/20 transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-accent to-accent-light text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-accent/40 animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Profile / Auth Button */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-cyber-teal text-white flex items-center justify-center text-xs font-black shadow-sm">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">{user.fullName}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 rounded-2xl"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.login', 'Đăng nhập')}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-accent/10 text-accent"
              >
                {user.role === 'ADMIN' ? t('nav.admin', 'Quản trị hệ thống') : '⚙️ Quản lý vận hành'}
              </Link>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
