import heroBg from '@/assets/hero.jpeg';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';

export default function Hero() {
  // const navigate = useNavigate();

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Hero background image */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat lg:bg-cover lg:bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Dark overlay so text remains readable */}
      <div className="absolute inset-0 bg-slate-950/70" />

      {/* <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center z-10 max-w-3xl mt-16"
      >
        <h2 className="text-amber-500 font-serif tracking-[0.2em] text-sm md:text-base mb-6 uppercase">
          In Loving Memory
        </h2>
        <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-8">
          Celebrating the Lives of Wilfred & Justina Ogbonna
        </h1>
        <p className="text-lg text-slate-300 mb-10 leading-relaxed font-light">
          Join us as we gather to honor their enduring legacy, share cherished memories, and celebrate the beautiful journey of our dear parents.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => navigate('/checkout')}
            className="bg-transparent border-2 border-amber-600 text-amber-500 hover:bg-amber-600 hover:text-white rounded-full px-8 py-6 text-lg tracking-wide transition-all"
          >
            Participate in Asoebi
          </Button>
        </motion.div>
      </motion.div> */}
    </section>
  );
}
