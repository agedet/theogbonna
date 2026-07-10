import { Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (location.pathname === '/') {
      // Already on the home page — just scroll to top smoothly
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Otherwise let React Router navigate normally; scroll-to-top is handled below
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2">
          <span className="text-xl font-serif text-amber-500 tracking-widest uppercase">
            Ogbonnas
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm tracking-wide">
          <a href="#memories" className="hover:text-amber-400 transition-colors">Memories</a>
          <a href="#invitation" className="hover:text-amber-400 transition-colors">Invitation</a>
          <a href="#asoebi" className="hover:text-amber-400 transition-colors">Asoebi</a>
          <Button 
            onClick={() => navigate('/checkout')}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6"
          >
            Get Material
          </Button>
        </div>

        {/* Mobile Nav via Shadcn Sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-200">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 border-l-white/10 text-white">
              <div className="flex flex-col gap-6 mt-12 text-lg">
                <a href="#memories">Memories</a>
                <a href="#invitation">Invitation</a>
                <a href="#asoebi">Asoebi</a>
                <Button onClick={() => navigate('/checkout')} className="bg-amber-600 w-full mt-4">
                  Get Material
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}