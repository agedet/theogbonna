import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { URLS } from '@/utils/routes';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <ShieldAlert className="size-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500">404</p>
          <h1 className="font-serif text-3xl text-white">Page not found</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-11 flex-1 rounded-xl border-white/10 text-slate-200 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go back
          </Button>
          <Button
            asChild
            className="h-11 flex-1 rounded-xl bg-amber-600 font-semibold text-white hover:bg-amber-700"
          >
            <Link to={URLS.HOME}>
              <Home className="mr-2 size-4" />
              Home
            </Link>
          </Button>
        </div>

        <p className="text-xs text-slate-600">
          Looking for the admin portal?{' '}
          <Link to={URLS.ADMIN_LOGIN} className="text-amber-400 hover:text-amber-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
