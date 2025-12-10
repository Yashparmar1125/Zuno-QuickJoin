import { Shield, MessageSquare, Users, BookOpen, Github, Linkedin, Twitter } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-xl font-extrabold text-zuno-blue">Zuno QuickJoin™</h3>
          <p className="text-sm text-zuno-charcoal/70 leading-relaxed">
            Crystal-clear, secure video calls that teams love—no downloads required.
          </p>
          <div className="flex items-center gap-3">
            <a href="#github" className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-gray-100 text-zuno-charcoal/70 hover:text-zuno-blue hover:bg-zuno-blue/10 transition">
              <Github size={20} />
            </a>
            <a href="#linkedin" className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-gray-100 text-zuno-charcoal/70 hover:text-zuno-blue hover:bg-zuno-blue/10 transition">
              <Linkedin size={20} />
            </a>
            <a href="#twitter" className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-gray-100 text-zuno-charcoal/70 hover:text-zuno-blue hover:bg-zuno-blue/10 transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zuno-charcoal uppercase tracking-wide">Product</h4>
          <ul className="space-y-2 text-sm text-zuno-charcoal/80">
            <li><a href="#features" className="flex items-center gap-2 hover:text-zuno-blue transition"><MessageSquare size={16} /> Features</a></li>
            <li><a href="#pricing" className="flex items-center gap-2 hover:text-zuno-blue transition"><Shield size={16} /> Security</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zuno-charcoal uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm text-zuno-charcoal/80">
            <li><a href="#about" className="flex items-center gap-2 hover:text-zuno-blue transition"><Users size={16} /> About Us</a></li>
            <li><a href="#contact" className="flex items-center gap-2 hover:text-zuno-blue transition"><MessageSquare size={16} /> Contact</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zuno-charcoal uppercase tracking-wide">Support</h4>
          <ul className="space-y-2 text-sm text-zuno-charcoal/80">
            <li><a href="#help" className="flex items-center gap-2 hover:text-zuno-blue transition"><BookOpen size={16} /> Help Center</a></li>
            <li><a href="#docs" className="flex items-center gap-2 hover:text-zuno-blue transition"><BookOpen size={16} /> Documentation</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-3 md:gap-0 md:items-center md:justify-between text-sm text-zuno-charcoal/70">
          <p className="m-0">&copy; {currentYear} Zuno. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#privacy" className="hover:text-zuno-blue transition">Privacy</a>
            <span className="text-gray-300">|</span>
            <a href="#terms" className="hover:text-zuno-blue transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
