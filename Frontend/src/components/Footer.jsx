import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Video, ArrowUpRight, Shield } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'QuickJoin™', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#changelog' },
  ],
  Company: [
    { label: 'About Zuno', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#careers', badge: 'Hiring' },
    { label: 'Press', href: '#press' },
    { label: 'Contact', href: '#contact' },
  ],
  Developers: [
    { label: 'Documentation', href: '#docs' },
    { label: 'API Reference', href: '#api' },
    { label: 'Status', href: '#status', badge: 'Operational' },
    { label: 'GitHub', href: '#github', external: true },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'GDPR', href: '#gdpr' },
  ],
};

const SOCIAL = [
  { icon: Github, href: '#github', label: 'GitHub' },
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zuno-gray-200 mt-auto">

      {/* ── CTA band ── */}
      <div className="border-b border-zuno-gray-100 bg-zuno-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-zuno-blue flex items-center justify-center shadow-brand-sm flex-shrink-0">
              <Video size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-zuno-charcoal">Start a meeting in seconds</p>
              <p className="text-xs text-zuno-gray-500 mt-0.5">No downloads. No friction. Just Zuno.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/meeting/demo"
              className="btn-secondary text-sm"
            >
              Try demo
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-signup-modal'))}
              className="btn-primary text-sm gap-1.5"
            >
              Get started free
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand column */}
          <div className="col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/logo dark.png" alt="Zuno" className="h-8 w-auto" />
              <div>
                <span className="block text-base font-black text-zuno-charcoal tracking-tight">Zuno</span>
                <span className="block text-2xs font-bold text-zuno-blue tracking-widest uppercase">QuickJoin™</span>
              </div>
            </Link>

            <p className="text-sm text-zuno-gray-500 leading-relaxed max-w-xs">
              The video conferencing platform built for modern teams. Part of the Zuno productivity ecosystem.
            </p>

            <div className="flex items-center gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-zuno-gray-100 flex items-center justify-center text-zuno-gray-500 hover:bg-zuno-blue-light hover:text-zuno-blue transition-all duration-150"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-zuno-gray-400">
              <Shield size={12} className="text-zuno-gray-400" />
              <span>SOC 2 Type II · ISO 27001 · GDPR</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zuno-gray-400">{section}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, href, badge, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="flex items-center gap-1.5 text-sm text-zuno-gray-500 hover:text-zuno-blue transition-colors duration-150 group"
                    >
                      {label}
                      {external && (
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      {badge && (
                        <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${badge === 'Hiring'
                            ? 'bg-zuno-mint-light text-zuno-mint'
                            : badge === 'Operational'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-zuno-gray-100 text-zuno-gray-500'
                          }`}>
                          {badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-zuno-gray-100 bg-zuno-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zuno-gray-400">
            © {year} Zuno Technologies, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-zuno-gray-400">
            <a href="#privacy" className="hover:text-zuno-blue transition-colors">Privacy</a>
            <span className="text-zuno-gray-200">·</span>
            <a href="#terms" className="hover:text-zuno-blue transition-colors">Terms</a>
            <span className="text-zuno-gray-200">·</span>
            <a href="#cookies" className="hover:text-zuno-blue transition-colors">Cookies</a>
            <span className="text-zuno-gray-200">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zuno-mint animate-pulse-slow" />
              All systems operational
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
