import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, Video, ChevronDown,
  Grid3X3, Mail, FileText, Calendar, BarChart2,
  MessageSquare, LogOut, Settings, User, Bell,
  Sparkles, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Zuno product suite (ecosystem switcher) ─────────────────────────── */
const PRODUCTS = [
  { name: 'QuickJoin', desc: 'Video meetings', icon: Video, color: 'bg-blue-500', href: '/', active: true },
  { name: 'Mail', desc: 'Email & inbox', icon: Mail, color: 'bg-red-500', href: '#', active: false },
  { name: 'Docs', desc: 'Collaborative docs', icon: FileText, color: 'bg-amber-500', href: '#', active: false },
  { name: 'Calendar', desc: 'Scheduling', icon: Calendar, color: 'bg-green-500', href: '#', active: false },
  { name: 'Analytics', desc: 'Insights & reports', icon: BarChart2, color: 'bg-purple-500', href: '#', active: false },
  { name: 'Chat', desc: 'Team messaging', icon: MessageSquare, color: 'bg-teal-500', href: '#', active: false },
];

const avatarUrl = (u) => {
  if (u?.photoURL) return u.photoURL;
  const label = encodeURIComponent(u?.name || u?.email || 'U');
  return `https://ui-avatars.com/api/?name=${label}&background=2563EB&color=fff&bold=true`;
};

/* ── Dropdown wrapper ────────────────────────────────────────────────── */
function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger(open)}</div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-50 mt-2 animate-scale-in ${align === 'right' ? 'right-0' : 'left-0'
              }`}
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Product Switcher ────────────────────────────────────────────────── */
function ProductSwitcher() {
  return (
    <Dropdown
      align="left"
      trigger={(open) => (
        <button
          className={`btn-icon rounded-lg transition-colors ${open ? 'bg-zuno-gray-100 text-zuno-charcoal' : ''}`}
          aria-label="Zuno products"
        >
          <Grid3X3 size={18} />
        </button>
      )}
    >
      {(close) => (
        <div className="w-72 card p-3 shadow-soft">
          <p className="section-label px-2 mb-2">Zuno Suite</p>
          <div className="grid grid-cols-3 gap-1">
            {PRODUCTS.map((p) => (
              <a
                key={p.name}
                href={p.href}
                onClick={close}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-150 group
                  ${p.active
                    ? 'bg-zuno-blue-light text-zuno-blue'
                    : 'hover:bg-zuno-gray-50 text-zuno-gray-600 hover:text-zuno-charcoal'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center shadow-sm`}>
                  <p.icon size={18} className="text-white" />
                </div>
                <span className="text-xs font-semibold leading-tight text-center">{p.name}</span>
                {!p.active && (
                  <span className="text-2xs text-zuno-gray-400 leading-tight">Soon</span>
                )}
              </a>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-zuno-gray-100">
            <a
              href="#"
              className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-zuno-gray-500 hover:text-zuno-blue hover:bg-zuno-blue-light transition-colors"
            >
              <span>Explore all Zuno products</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

/* ── User Menu ───────────────────────────────────────────────────────── */
function UserMenu({ user, onLogout }) {
  return (
    <Dropdown
      trigger={(open) => (
        <button
          className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all duration-150
            ${open
              ? 'border-zuno-blue bg-zuno-blue-light'
              : 'border-zuno-gray-200 hover:border-zuno-gray-300 bg-white hover:bg-zuno-gray-50'
            }`}
        >
          <img
            src={avatarUrl(user)}
            alt={user?.name || 'User'}
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="text-sm font-semibold text-zuno-charcoal max-w-[100px] truncate hidden sm:block">
            {user?.name?.split(' ')[0] || 'Account'}
          </span>
          <ChevronDown size={14} className={`text-zuno-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    >
      {(close) => (
        <div className="w-64 card shadow-soft overflow-hidden">
          {/* Profile header */}
          <div className="px-4 py-4 bg-gradient-to-br from-zuno-blue-light to-white border-b border-zuno-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl(user)}
                alt={user?.name || 'User'}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-zuno-charcoal truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-zuno-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="badge-blue text-2xs capitalize">{user?.role || 'user'} plan</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <Link
              to="/dashboard"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zuno-gray-700 hover:bg-zuno-gray-50 hover:text-zuno-charcoal transition-colors"
            >
              <LayoutDashboard size={16} className="text-zuno-gray-400" />
              Dashboard
            </Link>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zuno-gray-700 hover:bg-zuno-gray-50 hover:text-zuno-charcoal transition-colors"
            >
              <User size={16} className="text-zuno-gray-400" />
              Profile & settings
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zuno-gray-700 hover:bg-zuno-gray-50 hover:text-zuno-charcoal transition-colors"
            >
              <Settings size={16} className="text-zuno-gray-400" />
              Preferences
            </button>
          </div>

          <div className="p-1.5 border-t border-zuno-gray-100">
            <button
              onClick={() => { onLogout(); close(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zuno-red hover:bg-zuno-red-light transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

/* ── Main Header ─────────────────────────────────────────────────────── */
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => { await logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass border-b border-zuno-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-2">

          {/* ── Left: Product switcher + Logo ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <ProductSwitcher />

            <Link
              to="/"
              className="flex items-center gap-2.5 ml-1 hover:opacity-90 transition-opacity"
              aria-label="Zuno Home"
            >
              <picture>
                <source media="(prefers-color-scheme: dark)" srcSet="/logo_white.png" />
                <img src="/logo dark.png" alt="Zuno" className="h-8 w-auto" />
              </picture>
              <div className="leading-none">
                <span className="block text-base font-black text-zuno-charcoal tracking-tight">Zuno</span>
                <span className="block text-2xs font-bold text-zuno-blue tracking-widest uppercase">QuickJoin™</span>
              </div>
            </Link>
          </div>

          {/* ── Center: Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-6 flex-1">
            <Link
              to="/"
              className={isActive('/') ? 'nav-item-active' : 'nav-item'}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={isActive('/dashboard') ? 'nav-item-active' : 'nav-item'}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            )}
            <Link
              to="/meeting/demo"
              className="nav-item"
            >
              <Video size={15} />
              Try Demo
            </Link>
          </nav>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1.5 ml-auto">
            {user ? (
              <>
                {/* Notification bell */}
                <button className="btn-icon relative hidden sm:flex">
                  <Bell size={17} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-zuno-blue rounded-full" />
                </button>

                {/* New meeting shortcut */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex btn-primary text-xs px-3 py-2 gap-1.5"
                >
                  <Video size={14} />
                  New meeting
                </button>

                <UserMenu user={user} onLogout={onLogout} />
              </>
            ) : (
              <>
                <button
                  className="btn-ghost text-sm hidden sm:flex"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
                >
                  Sign in
                </button>
                <button
                  className="btn-primary text-sm"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-signup-modal'))}
                >
                  <Sparkles size={14} />
                  Get started
                </button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="btn-icon lg:hidden ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zuno-gray-100 bg-white animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              to="/"
              className={isActive('/') ? 'nav-item-active' : 'nav-item'}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={isActive('/dashboard') ? 'nav-item-active' : 'nav-item'}
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
            <Link
              to="/meeting/demo"
              className="nav-item"
              onClick={() => setMobileOpen(false)}
            >
              <Video size={16} />
              Try Demo
            </Link>

            <div className="pt-3 mt-3 border-t border-zuno-gray-100 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <img
                      src={avatarUrl(user)}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold text-zuno-charcoal">{user.name}</p>
                      <p className="text-xs text-zuno-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    className="w-full btn-secondary justify-start gap-2"
                    onClick={() => { onLogout(); setMobileOpen(false); }}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    className="btn-secondary w-full"
                    onClick={() => { window.dispatchEvent(new CustomEvent('open-login-modal')); setMobileOpen(false); }}
                  >
                    Sign in
                  </button>
                  <button
                    className="btn-primary w-full"
                    onClick={() => { window.dispatchEvent(new CustomEvent('open-signup-modal')); setMobileOpen(false); }}
                  >
                    <Sparkles size={14} />
                    Get started free
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
