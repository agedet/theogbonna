import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordField } from './PasswordField';
import { PasswordStrength } from './PasswordStrength';
import { AuthError } from './AuthError';

interface SetPasswordFormProps {
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
}

export function SetPasswordForm({ onSubmit }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(password, confirm);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        id="password"
        label="New Password *"
        value={password}
        onChange={setPassword}
        placeholder="Create a strong password"
        autoComplete="new-password"
      />

      <PasswordStrength password={password} />

      <PasswordField
        id="confirm"
        label="Confirm Password *"
        value={confirm}
        onChange={setConfirm}
        placeholder="Re-enter your password"
        disabled={submitting}
        autoComplete="new-password"
      />

      <AuthError message={formError} />

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
  );
}
