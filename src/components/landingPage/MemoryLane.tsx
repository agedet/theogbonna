import { motion } from 'framer-motion';
import { useState } from 'react';
import Daddy from '@/assets/parents-mordern.jpeg';
import Mummy from '@/assets/parents-old.jpeg';

const memories = [
  { id: 1, title: 'The Beginning', img: Daddy, rotation: -12 },
  { id: 2, title: 'Building a Home', img: Mummy, rotation: -6 },
  // { id: 3, title: 'Golden Years', img: DaddyAndMummy, rotation: 0 },
  // { id: 4, title: 'Family First', img: DaddyAndMummy2, rotation: 6 },
  // { id: 5, title: 'Everlasting', img: Daddy, rotation: 12 },
];

const defaultActiveIndex = Math.floor(memories.length / 2);

export default function MemoryLane() {
  const [activeIndex] = useState<number>(defaultActiveIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const currentIndex = hoveredIndex ?? activeIndex;

  const getCardProps = (index: number) => {
    const offset = index - currentIndex;
    const x = offset * 190;
    const y = index === currentIndex ? -20 : Math.abs(offset) * 12;
    const scale = index === currentIndex ? 1.06 : 0.86;
    const rotate = index === currentIndex ? 0 : memories[index].rotation + (offset < 0 ? -8 : 8);
    const zIndex = index === currentIndex ? 50 : 40 - Math.abs(offset);

    return { x, y, scale, rotate, zIndex };
  };

  return (
    <section className="py-32 px-4 md:px-6 bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-serif text-center text-amber-500 mb-20">Cherished Moments</h3>
        
        {/* Roller gallery container */}
        <div className="relative w-full h-[420px] md:h-[520px] mt-10 overflow-hidden">
          {memories.map((memory, i) => {
            const { x, y, scale, rotate, zIndex } = getCardProps(i);

            return (
              <motion.div
                key={memory.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex(null)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[240px] sm:w-[200px] sm:h-[280px] md:w-[260px] md:h-[360px] rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-b from-[#171717] to-[#050505] border border-white/10 shadow-2xl p-3 flex flex-col cursor-pointer focus:outline-none"
                style={{ zIndex }}
                animate={{ x, y, scale, rotate }}
                transition={{ type: 'spring', stiffness: 100, damping: 40 }}
              >
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex-1 w-full overflow-hidden rounded-xl md:rounded-2xl bg-slate-800 mb-3 md:mb-4 relative">
                  <img
                    src={memory.img}
                    alt={memory.title}
                    className="w-full h-full object-cover sepia-[.5] brightness-75 contrast-125 transition duration-500 ease-out hover:sepia-0 hover:brightness-100"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none" />
                </div>
                <div className="text-center pb-1 md:pb-2">
                  <p className="text-xs md:text-sm font-medium text-slate-400 transition-colors">
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