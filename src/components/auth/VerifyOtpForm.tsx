import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthError } from './AuthError';

interface VerifyOtpFormProps {
  email: string;
  onSubmit: (otp: string) => Promise<void>;
  onBack?: () => void;
}

export function VerifyOtpForm({ email, onSubmit, onBack }: VerifyOtpFormProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(otp);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-400 text-center">
        A 6-digit code was sent to <strong className="text-white">{email}</strong>
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="otp" className="text-slate-300">Verification Code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="000000"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 text-center tracking-widest text-lg font-mono"
        />
      </div>

      <AuthError message={error} />

      <Button
        type="submit"
        disabled={loading || otp.length < 6}
        className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Continue'}
      </Button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          ← Back to sign in
        </button>
      )}
    </form>
  );
}
