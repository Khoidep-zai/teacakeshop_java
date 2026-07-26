import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail, Sparkles, Send, ShieldCheck, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t('footer.subscribeSuccess', 'Cảm ơn bạn đã đăng ký nhận ưu đãi cá nhân hóa từ AI! ✨'));
    setEmail('');
  };

  return (
    <footer className="relative bg-slate-900 text-slate-200 pt-16 pb-8 transition-colors duration-300 border-t border-slate-800/80 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyber-teal/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white text-xl shadow-lg shadow-primary/30">
                🍵
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-serif-title">
                Tea&Cake <span className="text-primary-glow">Lounge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.description', 'Trải nghiệm trà thượng hạng và bánh thủ công trong không gian Cyber-Organic hiện đại bậc nhất 2026.')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-primary flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-accent flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200">
                <Instagram className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-1 text-xs text-cyber-teal bg-cyber-teal/10 px-3 py-1.5 rounded-full border border-cyber-teal/20 ml-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Sommelier 2026</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-bold text-white text-base mb-4 font-serif-title tracking-wide">{t('footer.quickLinks', 'Khám phá')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="text-slate-400 hover:text-primary-glow transition-colors">{t('nav.products', 'Danh mục Trà & Bánh')}</Link></li>
              <li><Link to="/combos" className="text-slate-400 hover:text-primary-glow transition-colors">{t('nav.combos', 'Set Trà Chiều Combo')}</Link></li>
              <li><Link to="/reservation" className="text-slate-400 hover:text-primary-glow transition-colors">{t('nav.reservation', 'Đặt bàn Lounge AI')}</Link></li>
              <li><Link to="/cart" className="text-slate-400 hover:text-primary-glow transition-colors">{t('nav.cart', 'Giỏ hàng của bạn')}</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-bold text-white text-base mb-4 font-serif-title tracking-wide">{t('footer.contact', 'Liên hệ Lounge')}</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-glow flex-shrink-0 mt-1" />
                <span>123 Đại Lộ Trà, Phường Nghệ Thuật, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-glow flex-shrink-0" />
                <span>+84 (028) 9999 8888</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-glow flex-shrink-0" />
                <span>lounge@teacakeshop.vn</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-bold text-white text-base mb-4 font-serif-title tracking-wide">{t('footer.newsletter', 'Đăng ký Nhận Ưu đãi AI')}</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {t('footer.subscribeText', 'Nhận đề xuất phối vị cá nhân hóa và voucher giảm 20% cho thành viên mới.')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder', 'Nhập email của bạn...')}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-glow"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-1.5 rounded-xl bg-gradient-to-r from-primary to-cyber-teal text-white hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Không spam, bảo mật thông tin 100%
              </span>
            </form>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Tea & Cake Lounge. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Thiết kế với</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
            <span>theo phong cách Cyber-Organic 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
