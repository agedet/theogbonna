import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Kept for call-site compatibility; layout is always compact. */
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn('w-full max-w-sm')}
      >
        <div className="text-center mb-8">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
            <ShieldCheck className="size-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-serif text-white">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          {children}
        </div>

        {footer}
      </motion.div>
    </div>
  );
}

export default AuthLayout;
