import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await loginApi({ email, password });
      await login(response.accessToken, response.refreshToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.error', 'Email hoặc mật khẩu không chính xác'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-card overflow-hidden flex flex-col md:flex-row border border-white/60 dark:border-slate-800"
      >
        {/* Left Side: Cyber-Organic Banner */}
        <div className="md:w-1/2 relative bg-slate-900 p-10 text-white flex flex-col justify-between overflow-hidden hidden md:flex">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyber-teal/30 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-cyber-teal mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cyber-Organic 2026</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold font-serif-title leading-tight">
              Chào Mừng Bạn Quay Trở Lại Lounge
            </h2>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Đăng nhập để nhận các đề xuất cá nhân hóa từ AI Sommelier và tích điểm thành viên hoàng gia.
            </p>
          </div>

          <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
            <p className="italic font-serif-title text-emerald-300">"Hương vị trà hảo hạng kết hợp công nghệ AI đưa cảm xúc thăng hoa."</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
              {t('login.title', 'Đăng Nhập Tài Khoản')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng điền thông tin bên dưới để tiếp tục
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-2xl text-xs mb-4 text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                {t('login.email', 'Địa chỉ Email')}
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 text-xs"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('login.password', 'Mật khẩu')}
                </label>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-xs font-extrabold shadow-lg mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Đăng Nhập Vào Lounge</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Chưa có tài khoản? &nbsp;
            <Link to="/register" className="font-bold text-primary hover:underline">
              Đăng ký thành viên ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
