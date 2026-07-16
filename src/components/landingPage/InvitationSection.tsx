import { motion } from 'framer-motion';
import InvitationCard from '@/assets/invitation-card-new.jpeg';

export default function InvitationSection() {
  return (
    <section
      id="invitation"
      className="flex justify-center bg-slate-950 px-4 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[20rem] rounded-[1.25rem] bg-gradient-to-b from-amber-500/20 to-transparent p-1.5 sm:max-w-md sm:rounded-[1.75rem] sm:p-2 md:max-w-xl md:rounded-[2rem]"
      >
        <img
          src={InvitationCard}
          alt="Remembrance Invitation"
          className="h-auto w-full rounded-2xl object-cover shadow-2xl shadow-amber-900/20 sm:rounded-3xl"
        />
      </motion.div>
    </section>
  );
}
