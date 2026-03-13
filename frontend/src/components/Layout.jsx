import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { RiDashboardLine, RiCompassLine, RiAddLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine,RiRobotLine } from 'react-icons/ri';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/',        icon: RiDashboardLine, label: '我的知识库' },
  { to: '/explore', icon: RiCompassLine,   label: '公共探索' },
  { to: '/rag',     icon: RiRobotLine,     label: 'AI问答' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Nav = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00C896, #009E78)' }}>
            <span className="text-black font-bold text-sm font-display">KT</span>
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white leading-none">知识阈值</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Knowledge Threshold</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div className="px-3 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
                isActive
                  ? 'bg-jade/10 text-jade font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Bottom: user + new entry */}
      <div className="px-3 pb-5 space-y-2">
        <button onClick={() => { navigate('/new'); setOpen(false); }}
          className="btn-primary w-full text-sm">
          <RiAddLine className="w-4 h-4" />
          新建知识
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
            style={{ background: 'var(--jade)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.username}</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.plan === 'pro' ? '✦ Pro' : '免费版'}</div>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
            title="退出登录">
            <RiLogoutBoxLine className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col flex-shrink-0 glass border-r" style={{ borderColor: 'var(--border)' }}>
        <Nav />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 glass border-r z-10" style={{ borderColor: 'var(--border)' }}>
            <Nav />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-md hover:bg-white/5">
            <RiMenuLine className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-sm">知识阈值</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
