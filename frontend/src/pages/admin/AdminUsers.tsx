import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { getUsers } from '../../api/admin';
import { updateUserActive, updateUserRole } from '../../api/auth';
import type { UserProfile } from '../../types';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const pageData = await getUsers();
      setUsers(pageData?.content ?? []);
    } catch (err: any) {
      setUsers([]);
      toast.error(err?.response?.data?.message || 'Không thể tải người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  ).filter(u => roleFilter === 'ALL' || u.role === roleFilter)
    .filter(u => activeFilter === 'ALL' || String(u.active) === activeFilter);

  const changeRole = async (account: UserProfile, role: UserProfile['role']) => {
    if (role === account.role) return;
    if (!window.confirm(`Đổi vai trò của ${account.fullName} từ ${account.role} sang ${role}?`)) return;
    try {
      await updateUserRole(account.id, role);
      toast.success('Đã cập nhật vai trò');
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật vai trò');
    }
  };

  const toggleActive = async (account: UserProfile) => {
    const next = !account.active;
    if (!window.confirm(`${next ? 'Mở khóa' : 'Khóa'} tài khoản ${account.email}?`)) return;
    try {
      await updateUserActive(account.id, next);
      toast.success(next ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      await fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật tài khoản');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyber-teal" />
            <span>Quản Lý Danh Sách Thành Viên Lounge 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif-title">
            Tài Khoản Khách Hàng & Quản Trị ({users.length})
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>
        <select className="input-field w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">Mọi vai trò</option><option value="CUSTOMER">Khách hàng</option>
          <option value="STAFF">Nhân viên</option><option value="ADMIN">Admin</option>
        </select>
        <select className="input-field w-40" value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
          <option value="ALL">Mọi trạng thái</option><option value="true">Hoạt động</option><option value="false">Bị khóa</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-extrabold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Thành Viên</th>
                <th className="px-6 py-4">Địa Chỉ Email</th>
                <th className="px-6 py-4">Số Điện Thoại</th>
                <th className="px-6 py-4">Vai Trò (Role)</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4">Ngày Tham Gia</th>
                <th className="px-6 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-semibold">
                    Đang tải tài khoản thành viên...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-semibold">
                    Chưa có tài khoản nào.
                  </td>
                </tr>
              ) : (
                filtered.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">#{usr.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-black flex items-center justify-center">
                        {usr.fullName?.charAt(0) || 'U'}
                      </div>
                      <span>{usr.fullName}</span>
                    </td>
                    <td className="px-6 py-4 font-mono">{usr.email}</td>
                    <td className="px-6 py-4 font-semibold">{usr.phone || 'Chưa cập nhật'}</td>
                    <td className="px-6 py-4">
                      {usr.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                          <ShieldCheck size={12} /> Quản Trị Viên (ADMIN)
                        </span>
                      ) : usr.role === 'STAFF' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          <ShieldCheck size={12} /> Nhân Viên (STAFF)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                          <Users size={12} /> Thành Viên Khách Hàng
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${usr.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        <CheckCircle2 size={12} /> {usr.active ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(usr.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 space-y-2">
                      <select value={usr.role} onChange={e => void changeRole(usr, e.target.value as UserProfile['role'])}
                        className="input-field min-w-28">
                        <option value="CUSTOMER">CUSTOMER</option><option value="STAFF">STAFF</option><option value="ADMIN">ADMIN</option>
                      </select>
                      <button className={usr.active ? 'btn-secondary text-red-600' : 'btn-primary'}
                        onClick={() => void toggleActive(usr)}>{usr.active ? 'Khóa' : 'Mở khóa'}</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
