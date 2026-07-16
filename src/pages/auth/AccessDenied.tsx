import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { URLS } from '@/utils/routes';
import { useAuthContext } from '@/context/useAuthContext';
import { getDashboardByRole } from '@/utils/routeConfig';

export default function AccessDenied() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, role, logout } = useAuthContext();

  const errorMessage =
    searchParams.get('error') ||
    'You do not have permission to access this page.';

  async function handleSignIn() {
    if (isAuthenticated) {
      await logout();
    }
    navigate(URLS.ADMIN_LOGIN, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <ShieldOff className="size-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-white">Access Denied</h1>
          <p className="text-sm leading-relaxed text-slate-400">{errorMessage}</p>
        </div>

        <p className="text-xs text-slate-500">
          If you believe this is a mistake, contact your administrator or sign in with an authorized account.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isAuthenticated && role ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getDashboardByRole(role), { replace: true })}
              className="h-11 flex-1 rounded-xl border-white/10 text-slate-200 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="mr-2 size-4" />
              My dashboard
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 rounded-xl border-white/10 text-slate-200 hover:bg-white/5 hover:text-white"
            >
              <Link to={URLS.HOME}>
                <ArrowLeft className="mr-2 size-4" />
                Home
              </Link>
            </Button>
          )}
          <Button
            type="button"
            onClick={() => void handleSignIn()}
            className="h-11 flex-1 rounded-xl bg-amber-600 font-semibold text-white hover:bg-amber-700"
          >
            <LogIn className="mr-2 size-4" />
            Return to login
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export { AccessDenied };
