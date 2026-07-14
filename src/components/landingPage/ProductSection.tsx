import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Material1 from '@/assets/material1.png';
import Material from '@/assets/material2.png';

export default function ProductSection() {
  const navigate = useNavigate();

  return (
    <section id="asoebi" className="py-32 px-6 bg-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="space-y-6 relative">
          <motion.img 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            src={Material1} 
            alt="Asoebi Fabric Lace" 
            className="w-4/5 rounded-2xl shadow-xl z-10 relative"
          />

          <motion.img 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            src={Material} 
            alt="Asoebi Gele" 
            className="w-3/5 rounded-2xl shadow-2xl absolute -bottom-16 -right-4 border-4 border-slate-900"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8 lg:pl-12 mt-16 lg:mt-0"
        >
          <div>
            <h2 className="text-4xl font-serif text-white mb-4">
                Official Asoebi Material
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Honor our parents' memory by adorning this premium selected fabric. 
              Each package is carefully curated for our esteemed guests.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-slate-300">Material Type</span>
              <span className="text-white font-medium">5 Yards Beaded Lace & Gele</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-slate-300">Price</span>
              <span className="text-amber-500 font-bold text-xl">£100 (or NGN Equivalent)</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-slate-300">Payment Deadline</span>
              <span className="text-red-400 font-medium">September 30, 2026</span>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/checkout')}
            size="lg"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-14 text-lg shadow-lg shadow-amber-900/20"
          >
            Proceed to Get Material
          </Button>
          <p className="text-xs text-center text-slate-500">
            * Delivery is available to your choice destination in Nigeria (cost of delivery to be added at checkout).
          </p>
        </motion.div>
      </div>
    </section>
  );
}