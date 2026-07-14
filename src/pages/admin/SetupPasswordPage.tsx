import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface TokenInfo {
  valid:    boolean;
  user:     { email: string | null; firstName?: string; lastName?: string; role?: string };
}

interface PasswordFieldProps {
  id:          string;
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
  disabled?:   boolean;
}

function PasswordField({ id, label, value, onChange, placeholder, disabled }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-300">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 pr-10"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter',       ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',       ok: /[a-z]/.test(password) },
    { label: 'Number',                 ok: /\d/.test(password) },
    { label: 'Special character',      ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-amber-400', 'bg-emerald-400'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i < score ? colors[score - 1] : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(c => (
          <p key={c.label} className={`flex items-center gap-1 text-xs transition-colors ${c.ok ? 'text-emerald-400' : 'text-slate-600'}`}>
            <span>{c.ok ? '✓' : '○'}</span> {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const token         = params.get('token') ?? '';
  const email         = params.get('email') ?? '';

  const [tokenInfo,   setTokenInfo]   = useState<TokenInfo | null>(null);
  const [verifying,   setVerifying]   = useState(true);
  const [tokenError,  setTokenError]  = useState<string | null>(null);

  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState<string | null>(null);
  const [done,        setDone]        = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) { setTokenError('No invitation token found in the URL.'); setVerifying(false); return; }
    api.get<TokenInfo>(`/auth/verify-invitation?token=${encodeURIComponent(token)}`)
      .then(info => setTokenInfo(info))
      .catch(err  => setTokenError((err as Error).message))
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.'); return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/setup-password', {
        invitationToken: token,
        newPassword:     password,
        confirmPassword: confirm,
      });
      setDone(true);
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err) {
      setFormError((err as Error).message);
    } finally { setSubmitting(false); }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-amber-500" />
      </div>
    );
  }

  // ── Invalid / expired token ───────────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-4">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto">
            <AlertCircle className="size-7 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Invalid Invitation</h1>
          <p className="text-slate-400 text-sm">{tokenError}</p>
          <p className="text-slate-500 text-xs">
            Ask your super-admin to send a new invitation, or{' '}
            <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 transition-colors">
              sign in
            </Link>{' '}
            if you already have an account.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            className="inline-flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto">
            <CheckCircle2 className="size-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-xl font-semibold text-white">Password set!</h1>
          <p className="text-slate-400 text-sm">
            Your account is ready. Redirecting to the login page…
          </p>
          <Link to="/admin/login"
            className="inline-block text-xs text-amber-400 hover:text-amber-300 transition-colors">
            Go to login →
          </Link>
        </motion.div>
      </div>
    );
  }

  const firstName = tokenInfo?.user?.firstName ?? email.split('@')[0];

  // ── Form ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
            <ShieldCheck className="size-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-serif text-white">Set Up Your Account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome{firstName ? `, ${firstName}` : ''}! Create your password to continue.
          </p>
          {email && (
            <p className="text-xs text-slate-600 mt-1">{email}</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="password"
              label="New Password *"
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
            />

            <PasswordStrength password={password} />

            <PasswordField
              id="confirm"
              label="Confirm Password *"
              value={confirm}
              onChange={setConfirm}
              placeholder="Re-enter your password"
              disabled={submitting}
            />

            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" />{formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || password.length < 8 || password !== confirm}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl mt-2 disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 className="mr-2 size-4 animate-spin" />Setting up…</>
                : 'Set Password & Continue'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
