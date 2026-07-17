import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Material1 from '@/assets/material1.png';
import Material from '@/assets/material2.png';

export default function ProductSection() {
  const navigate = useNavigate();

  return (
    <section id="asoebi" className="bg-slate-900 px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        {/* Image collage */}
        <div className="relative mx-auto w-full max-w-md pb-16 sm:max-w-lg sm:pb-20 lg:mx-0 lg:max-w-none lg:pb-24">
          <motion.img
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            src={Material1}
            alt="Asoebi Fabric Lace"
            className="relative z-10 w-[78%] max-w-full rounded-xl object-cover shadow-xl sm:rounded-2xl aspect-[4/5] sm:aspect-auto sm:max-h-[28rem] lg:max-h-[30rem]"
          />

          <motion.img
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            src={Material}
            alt="Asoebi Gele"
            className="absolute -right-1 bottom-0 z-20 w-[52%] max-w-[14rem] rounded-xl border-4 border-slate-900 object-cover shadow-2xl sm:-right-2 sm:bottom-2 sm:w-[48%] sm:max-w-[16rem] sm:rounded-2xl md:max-w-[18rem] aspect-[3/4]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6 sm:space-y-8 lg:mt-0 lg:pl-8 xl:pl-12"
        >
          <div>
            <h2 className="mb-3 font-serif text-2xl text-white sm:mb-4 sm:text-3xl md:text-4xl">
              Official Asoebi Material
            </h2>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Honor our parents&apos; memory by adorning this premium selected fabric.
              Each package is carefully curated for our esteemed guests.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:space-y-4 sm:p-6">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
              <span className="text-sm text-slate-300">Material Type</span>
              <span className="text-sm font-medium text-white sm:text-right">
                5 Yards Beaded Lace &amp; Gele
              </span>
            </div>
            <div className="flex flex-col gap-1 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
              <span className="text-sm text-slate-300">Price</span>
              <span className="text-lg font-bold text-amber-500 sm:text-xl">
                £100 (or NGN Equivalent)
              </span>
            </div>
            <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:pb-2">
              <span className="text-sm text-slate-300">Payment Deadline</span>
              <span className="font-medium text-red-400">September 30, 2026</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            size="lg"
            className="h-12 w-full rounded-xl bg-amber-600 text-base text-white shadow-lg shadow-amber-900/20 hover:bg-amber-700 sm:h-14 sm:text-lg"
          >
            Proceed to Get Material
          </Button>
          <p className="text-center text-[0.7rem] leading-relaxed text-slate-500 sm:text-xs">
            * Delivery is available to your choice destination in Nigeria (cost of delivery to be
            added at checkout).
          </p>
        </motion.div>
      </div>
    </section>
  );
}
