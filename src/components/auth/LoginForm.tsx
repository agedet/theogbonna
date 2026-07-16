import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthError } from './AuthError';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-slate-300">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@ogbonnamemorial.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-slate-300">Password</Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-11"
        />
      </div>

      <AuthError message={error} />

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );
}
