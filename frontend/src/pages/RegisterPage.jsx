import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('密码至少6位'); return; }
    const res = await register(form.username, form.email, form.password);
    if (res.ok) { toast.success('注册成功，开始探索吧！'); navigate('/'); }
    else toast.error(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00C896, transparent)' }} />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #00C896, #009E78)' }}>
            <span className="text-black font-display font-bold text-lg">KT</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">创建账号</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>开始构建你的知识空间</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>用户名</label>
              <input className="input-base" type="text" placeholder="your_name" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>邮箱</label>
              <input className="input-base" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>密码</label>
              <input className="input-base" type="password" placeholder="至少6位" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? '创建中...' : '创建账号'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
          已有账号？{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--jade)' }}>立即登录</Link>
        </p>
      </div>
    </div>
  );
}
