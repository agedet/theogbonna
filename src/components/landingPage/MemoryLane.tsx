import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Daddy from '@/assets/parents-mordern.jpeg';
import Mummy from '@/assets/parents-old.jpeg';
import DaddyAndMummy from '@/assets/desktop-hero.jpeg';

const memories = [
  { id: 1, title: 'The Beginning', img: Mummy, rotation: -12 },
  { id: 2, title: 'Building a Home', img: Daddy, rotation: -6 },
  { id: 3, title: 'Golden Years', img: DaddyAndMummy, rotation: 0 },
];

const defaultActiveIndex = Math.floor(memories.length / 2);

function useCardSpread() {
  const [spread, setSpread] = useState(120);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 480) setSpread(88);
      else if (w < 640) setSpread(110);
      else if (w < 768) setSpread(140);
      else if (w < 1024) setSpread(170);
      else setSpread(200);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return spread;
}

export default function MemoryLane() {
  const [activeIndex] = useState<number>(defaultActiveIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const currentIndex = hoveredIndex ?? activeIndex;
  const spread = useCardSpread();

  const getCardProps = (index: number) => {
    const offset = index - currentIndex;
    const x = offset * spread;
    const y = index === currentIndex ? -16 : Math.abs(offset) * 10;
    const scale = index === currentIndex ? 1.05 : 0.84;
    const rotate =
      index === currentIndex ? 0 : memories[index].rotation + (offset < 0 ? -6 : 6);
    const zIndex = index === currentIndex ? 50 : 40 - Math.abs(offset);

    return { x, y, scale, rotate, zIndex };
  };

  return (
    <section className="overflow-hidden bg-background px-3 py-16 sm:px-4 sm:py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-10 text-center font-serif text-2xl text-amber-500 sm:mb-14 sm:text-3xl md:mb-20">
          Cherished Moments
        </h3>

        <div className="relative mt-4 h-[340px] w-full overflow-hidden sm:mt-8 sm:h-[400px] md:h-[480px] lg:h-[520px]">
          {memories.map((memory, i) => {
            const { x, y, scale, rotate, zIndex } = getCardProps(i);

            return (
              <motion.div
                key={memory.id}
                tabIndex={0}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(i)}
                className="absolute top-1/2 left-1/2 flex h-[200px] w-[130px] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col rounded-[1.25rem] border border-white/10 bg-gradient-to-b from-[#171717] to-[#050505] p-2 shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 sm:h-[240px] sm:w-[160px] sm:rounded-[1.5rem] sm:p-2.5 md:h-[320px] md:w-[220px] md:rounded-[2rem] md:p-3 lg:h-[460px] lg:w-[360px]"
                style={{ zIndex }}
                animate={{ x, y, scale, rotate }}
                transition={{ type: 'spring', stiffness: 100, damping: 40 }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="relative mb-2 min-h-0 flex-1 overflow-hidden rounded-xl bg-slate-800 sm:mb-3 md:mb-4 md:rounded-2xl">
                  <img
                    src={memory.img}
                    alt={memory.title}
                    className="h-full w-full object-cover sepia-[.5] brightness-75 contrast-125 transition duration-500 ease-out hover:sepia-0 hover:brightness-100"
                  />
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
                </div>
                <div className="pb-0.5 text-center sm:pb-1 md:pb-2">
                  <p className="text-[0.65rem] font-medium text-slate-400 transition-colors sm:text-xs md:text-sm">
                    {memory.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
