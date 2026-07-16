import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout, SetPasswordForm } from '@/components/auth';
import AuthService from '@/services/auth';
import type { IVerifyInvitationResponse } from '@/services/auth/types';
import { URLS } from '@/utils/routes';

export default function SetupPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const [tokenInfo, setTokenInfo] = useState<IVerifyInvitationResponse | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('No invitation token found in the URL.');
      setVerifying(false);
      return;
    }
    AuthService.verifyInvitation(token)
      .then(info => setTokenInfo(info))
      .catch(err => setTokenError((err as Error).message))
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleSubmit(password: string, confirmPassword: string) {
    await AuthService.setupPassword({
      invitationToken: token,
      newPassword: password,
      confirmPassword,
    });
    setDone(true);
    setTimeout(() => navigate(URLS.LOGIN), 3000);
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto">
            <AlertCircle className="size-7 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Invalid Invitation</h1>
          <p className="text-slate-400 text-sm">{tokenError}</p>
          <p className="text-slate-500 text-xs">
            Ask your super-admin to send a new invitation, or{' '}
            <Link to={URLS.LOGIN} className="text-amber-400 hover:text-amber-300 transition-colors">
              sign in
            </Link>{' '}
            if you already have an account.
          </p>
        </motion.div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            className="inline-flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto"
          >
            <CheckCircle2 className="size-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-xl font-semibold text-white">Password set!</h1>
          <p className="text-slate-400 text-sm">
            Your account is ready. Redirecting to the login page…
          </p>
          <Link
            to={URLS.LOGIN}
            className="inline-block text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Go to login →
          </Link>
        </motion.div>
      </div>
    );
  }

  const firstName = tokenInfo?.user?.firstName ?? email.split('@')[0];
  const subtitle = [
    `Welcome${firstName ? `, ${firstName}` : ''}! Create your password to continue.`,
    email,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <AuthLayout
      title="Set Up Your Account"
      subtitle={subtitle}
      footer={
        <p className="text-center text-xs text-slate-600 mt-4">
          Already have an account?{' '}
          <Link to={URLS.LOGIN} className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign in
          </Link>
        </p>
      }
    >
      <SetPasswordForm onSubmit={handleSubmit} />
    </AuthLayout>
  );
}
