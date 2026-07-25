import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-12 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col space-y-4">
          <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-2xl">
            <Coffee className="w-8 h-8" />
            <span>Tea & Cake</span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('footer.description', 'Experience the best premium teas and delicious hand-crafted cakes.')}
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">{t('footer.quickLinks', 'Quick Links')}</h3>
          <ul className="space-y-2">
            <li><Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">{t('nav.products', 'Products')}</Link></li>
            <li><Link to="/combos" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">{t('nav.combos', 'Combos')}</Link></li>
            <li><Link to="/reservation" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">{t('nav.reservation', 'Reservation')}</Link></li>
            <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">{t('nav.about', 'About Us')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">{t('footer.contact', 'Contact Us')}</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3 text-gray-500 dark:text-gray-400">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">123 Tea Street, Cake District, Food City</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm">hello@teacakeshop.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">{t('footer.newsletter', 'Newsletter')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('footer.subscribeText', 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.')}
          </p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder', 'Enter your email')}
              className="px-4 py-2 w-full rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-r-md transition-colors font-medium"
            >
              {t('footer.subscribeBtn', 'Subscribe')}
            </button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Tea & Cake Shop. {t('footer.rights', 'All rights reserved.')}
      </div>
    </footer>
  );
};

export default Footer;
