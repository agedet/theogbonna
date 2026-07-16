import { motion } from 'framer-motion';
import InvitationCard from '@/assets/invitation-card-new.jpeg';

export default function InvitationSection() {
  return (
    <section id="invitation" className="py-32 px-6 flex justify-center bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full p-2 bg-gradient-to-b from-amber-500/20 to-transparent rounded-[2rem]"
      >
        <img 
          src={InvitationCard} 
          alt="Remembrance Invitation" 
          className="w-full rounded-3xl shadow-2xl shadow-amber-900/20"
        />
      </motion.div>
    </section>
  );
}