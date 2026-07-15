import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import OgbonnaLogo from '@/assets/ogbonna-logo.png'

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileOpen(false);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-6 h-[100px] flex items-center justify-between">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2">
          <img 
            src={OgbonnaLogo}
            alt='logo'
            className="h-16 w-auto object-contain"
          />
        </Link>
        {/* <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2">
          <span className="text-xl font-serif text-amber-500 tracking-widest uppercase">
            Ogbonnas
          </span>
        </Link> */}

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm tracking-wide">
          <a href="#memories"   className="hover:text-amber-400 transition-colors">Memories</a>
          <a href="#invitation" className="hover:text-amber-400 transition-colors">Invitation</a>
          <a href="#asoebi"     className="hover:text-amber-400 transition-colors">Asoebi</a>
          <Button
            onClick={() => navigate('/checkout')}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6"
          >
            Get Material
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center text-slate-200 hover:text-white transition-colors p-1"
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* ── Mobile dropdown — sits directly below the bar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden bg-slate-950/95 backdrop-blur-md border-b border-white/10 px-6 pb-6 pt-4 flex flex-col gap-5 text-base tracking-wide"
          >
            <a href="#memories"   onClick={closeMobile} className="hover:text-amber-400 transition-colors">Memories</a>
            <a href="#invitation" onClick={closeMobile} className="hover:text-amber-400 transition-colors">Invitation</a>
            <a href="#asoebi"     onClick={closeMobile} className="hover:text-amber-400 transition-colors">Asoebi</a>
            <Button
              onClick={() => { closeMobile(); navigate('/checkout'); }}
              className="bg-amber-600 hover:bg-amber-700 text-white w-full rounded-xl"
            >
              Get Material
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
