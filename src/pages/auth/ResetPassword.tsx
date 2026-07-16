import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout, AuthError, SetPasswordForm } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthService from '@/services/auth';
import {
  clearPasswordResetEmail,
  getAuthErrorMessage,
  getPasswordResetEmail,
  maskEmail,
  setAuthFlashMessage,
} from '@/utils/auth-storage';
import { URLS } from '@/utils/routes';

export default function ResetPassword() {
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = getPasswordResetEmail();
    if (!stored) {
      navigate(URLS.FORGOT_PASSWORD, { replace: true });
      return;
    }
    setEmail(stored);
  }, [navigate]);

  const canVerifyOtp = useMemo(() => otp.length === 6, [otp]);

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!canVerifyOtp) {
      setError('Enter the 6-digit code');
      return;
    }
    setIsSubmitting(true);
    try {
      await AuthService.verifyForgotPasswordOtp({ email, otpCode: otp });
      setSuccess('Code verified. Set your new password.');
      setStep('password');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(password: string, confirmPassword: string) {
    await AuthService.resetPassword({
      email,
      otpCode: otp,
      newPassword: password,
      confirmPassword,
    });
    clearPasswordResetEmail();
    setAuthFlashMessage('Password updated. Please sign in.');
    navigate(URLS.LOGIN, { replace: true });
  }

  if (!email) return null;

  return (
    <AuthLayout
      title={step === 'otp' ? 'Reset Password' : 'New Password'}
      subtitle={
        step === 'otp'
          ? `Enter the code sent to ${maskEmail(email)}`
          : 'Choose a strong password for your account'
      }
      footer={
        <p className="text-center text-xs text-slate-600 mt-4">
          <Link to={URLS.LOGIN} className="text-amber-400 hover:text-amber-300">
            Back to Sign In
          </Link>
        </p>
      }
    >
      {step === 'otp' ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-slate-300">Verification Code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11 text-center tracking-widest font-mono text-lg"
            />
          </div>
          <AuthError message={error || null} />
          {success && <p className="text-sm text-emerald-400">{success}</p>}
          <Button
            type="submit"
            disabled={!canVerifyOtp || isSubmitting}
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Verify Code'}
          </Button>
        </form>
      ) : (
        <SetPasswordForm onSubmit={handleResetPassword} />
      )}
    </AuthLayout>
  );
}
