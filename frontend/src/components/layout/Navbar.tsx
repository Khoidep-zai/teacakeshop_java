import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { itemCount } = useCart();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-2 rounded-xl group-hover:opacity-90 transition-all transform group-hover:scale-105 duration-200">
              🍵
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              TeaCake<span className="text-primary">Shop</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
              {t('nav.home', 'Trang chủ')}
            </Link>
            <Link to="/products" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
              {t('nav.products', 'Sản phẩm')}
            </Link>
            <Link to="/combos" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
              {t('nav.combos', 'Combo')}
            </Link>
            <Link to="/reservation" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-medium text-sm transition-colors">
              {t('nav.reservation', 'Đặt bàn')}
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-accent hover:text-accent/80 font-bold text-sm transition-colors">
                {t('nav.admin', 'Quản trị')}
              </Link>
            )}
          </div>

          {/* Actions & Toggles */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              title={t('language', 'Đổi ngôn ngữ')}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{i18n.language || 'vi'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('theme', 'Đổi giao diện')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Profile / Auth Button */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.fullName}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-xs sm:text-sm px-4 py-2 flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.login', 'Đăng nhập')}</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
