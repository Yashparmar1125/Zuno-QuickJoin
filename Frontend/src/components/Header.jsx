import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const avatarUrl = (u) => {
  if (u?.photoURL) return u.photoURL;
  const label = encodeURIComponent(u?.name || u?.email || "User");
  return `https://ui-avatars.com/api/?name=${label}&background=0D8ABC&color=fff`;
};

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition" aria-label="Zuno Home">
          <picture>
            <source media="(prefers-color-scheme: dark)" srcSet="/logo_white.png" />
            <img
              src="/logo_dark.png"
              alt="Zuno"
              className="h-12 w-auto"
            />
          </picture>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-zuno-charcoal tracking-tight">Zuno</span>
            <span className="block text-xs font-semibold text-zuno-charcoal/70 tracking-wide">QuickJoin™</span>
          </span>
        </Link>
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-zuno-blue/10 transition"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link to="/" className="px-3 py-2 rounded-full text-zuno-charcoal hover:bg-zuno-blue/10 transition flex items-center gap-2">
            
            <span>Home</span>
          </Link>
          <Link to="/meeting/demo" className="px-3 py-2 rounded-full text-zuno-charcoal hover:bg-zuno-blue/10 transition flex items-center gap-2">
            
            <span>Join Demo</span>
          </Link>
          {user && (
            <Link to="/dashboard" className="px-3 py-2 rounded-full text-zuno-charcoal hover:bg-zuno-blue/10 transition flex items-center gap-2">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={avatarUrl(user)}
                alt={user.name || 'User'}
                referrerPolicy="no-referrer"
              />
              <button className="px-3 py-2 rounded-md border border-zuno-blue text-zuno-blue font-semibold hover:bg-zuno-blue/10 transition text-sm" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="px-3 py-2 rounded-md border border-zuno-blue text-zuno-blue font-semibold hover:bg-zuno-blue/10 transition text-sm"
                onClick={() => window.dispatchEvent(new CustomEvent("open-login-modal"))}
              >
                Sign in
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-md bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition text-sm shadow-brand"
                onClick={() => window.dispatchEvent(new CustomEvent("open-signup-modal"))}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-sm">
          <div className="px-4 py-3 space-y-3">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              <Link to="/" className="px-3 py-2 rounded-md text-zuno-charcoal hover:bg-zuno-blue/10 transition flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link to="/meeting/demo" className="px-3 py-2 rounded-md text-zuno-charcoal hover:bg-zuno-blue/10 transition flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <LogIn size={18} />
                <span>Join Demo</span>
              </Link>
            </nav>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <img className="h-8 w-8 rounded-full object-cover" src={avatarUrl(user)} alt={user.name || 'User'} referrerPolicy="no-referrer" />
                    <span className="font-semibold text-zuno-charcoal">{user.name}</span>
                  </div>
                  <button className="px-3 py-2 rounded-md border border-zuno-blue text-zuno-blue font-semibold hover:bg-zuno-blue/10 transition text-sm" onClick={() => { onLogout(); setMenuOpen(false); }}>Logout</button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md border border-zuno-blue text-zuno-blue font-semibold hover:bg-zuno-blue/10 transition text-sm text-center"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-login-modal"));
                      setMenuOpen(false);
                    }}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-zuno-blue text-white font-semibold hover:bg-zuno-blue-strong transition text-sm shadow-brand text-center"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-signup-modal"));
                      setMenuOpen(false);
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
