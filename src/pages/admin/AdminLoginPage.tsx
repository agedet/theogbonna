import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

type Stage = 'credentials' | 'otp';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();

  const [stage,         setStage]         = useState<Stage>('credentials');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [otp,           setOtp]           = useState('');
  const [sessionToken,  setSessionToken]  = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await login(email, password);
      setSessionToken(res.sessionToken);
      setStage('otp');
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const user = await verifyOtp(sessionToken, otp);
      navigate(user.role === 'super_admin' ? '/super-admin' : '/admin');
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
            <ShieldCheck className="size-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-serif text-white">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Ogbonna Memorial</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          {stage === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input id="email" type="email" required autoComplete="email"
                  placeholder="admin@ogbonnamemorial.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input id="password" type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="size-4 shrink-0" />{error}
                </div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl">
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-4">
              <p className="text-sm text-slate-400 text-center">
                A 6-digit code was sent to <strong className="text-white">{email}</strong>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-slate-300">Verification Code</Label>
                <Input id="otp" type="text" inputMode="numeric" maxLength={6} required
                  placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 text-center tracking-widest text-lg font-mono" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="size-4 shrink-0" />{error}
                </div>
              )}

              <Button type="submit" disabled={loading || otp.length < 6}
                className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl">
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Continue'}
              </Button>
              <button type="button" onClick={() => { setStage('credentials'); setError(null); }}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors">
                ← Back to sign in
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
