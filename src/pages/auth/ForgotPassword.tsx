import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout, AuthError } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthService from '@/services/auth';
import {
  getAuthErrorMessage,
  storePasswordResetEmail,
} from '@/utils/auth-storage';
import { URLS } from '@/utils/routes';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isFormValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isFormValid) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await AuthService.forgotPassword({ email });
      storePasswordResetEmail(email);
      setSuccess(
        response.message ||
          'If an account exists with this email, a password reset code has been sent.',
      );
      setTimeout(() => navigate(URLS.RESET_PASSWORD, { replace: true }), 1500);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to send reset code'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset code"
      footer={
        <p className="text-center text-xs text-slate-600 mt-4">
          Remember your password?{' '}
          <Link to={URLS.LOGIN} className="text-amber-400 hover:text-amber-300">
            Sign In
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="admin@ogbonnamemorial.com"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11"
          />
        </div>

        <AuthError message={error || null} />
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Send Reset Code'}
        </Button>
      </form>
    </AuthLayout>
  );
}