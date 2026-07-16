import desktopHero from '@/assets/desktop-hero.jpeg';
import mobileHero from '@/assets/mobile-hero.jpeg';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-end justify-center overflow-hidden px-4 pb-14 pt-[7.5rem] sm:px-6 sm:pb-16 md:items-center md:pt-28 lg:px-8"
    >
      {/* Mobile / tablet — portrait crop */}
      <div
        className="absolute inset-0 bg-cover bg-[center_20%] bg-no-repeat md:hidden"
        style={{ backgroundImage: `url(${mobileHero})` }}
        aria-hidden
      />
      {/* Desktop — landscape hero */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: `url(${desktopHero})` }}
        aria-hidden
      />

      {/* Dark amber overlay — keeps faces visible and text readable */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-black/70 to-amber-950/40 md:bg-gradient-to-b md:from-amber-950/75 md:via-black/60 md:to-amber-950/50"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-3xl text-center"
      >
        <h2 className="mb-3 font-serif text-[0.7rem] uppercase tracking-[0.2em] text-amber-500 sm:mb-4 sm:text-sm md:mb-6 md:text-base">
          In Loving Memory
        </h2>
        <h1 className="mb-4 font-serif text-[1.85rem] leading-tight text-white sm:mb-6 sm:text-4xl md:mb-8 md:text-6xl lg:text-7xl">
          Celebrating the Lives of Wilfred &amp; Justina Ogbonna
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed font-light text-slate-300 sm:mb-10 sm:text-base md:text-lg">
          Join us as we gather to honor their enduring legacy, share cherished memories, and celebrate the beautiful journey of our dear parents.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => navigate('/checkout')}
            className="rounded-full border-2 border-amber-600 bg-transparent px-6 py-5 text-base tracking-wide text-amber-500 transition-all hover:bg-amber-600 hover:text-white sm:px-8 sm:py-6 sm:text-lg backdrop-blur-3xl"
          >
            Participate in Asoebi
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
