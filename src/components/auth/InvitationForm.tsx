import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface InvitationFormProps {
  onSuccess?: () => void;
}

export function InvitationForm({ onSuccess }: InvitationFormProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', jobTitle: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function patch(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/admin/invite', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        jobTitle: form.jobTitle.trim() || undefined,
      });
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', jobTitle: '' });
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300">First Name <span className="text-amber-500">*</span></Label>
          <Input
            required
            value={form.firstName}
            onChange={patch('firstName')}
            placeholder="Chukwuemeka"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300">Last Name <span className="text-amber-500">*</span></Label>
          <Input
            required
            value={form.lastName}
            onChange={patch('lastName')}
            placeholder="Ogbonna"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300">Email Address <span className="text-amber-500">*</span></Label>
        <Input
          required
          type="email"
          value={form.email}
          onChange={patch('email')}
          placeholder="admin@ogbonnamemorial.com"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300">
          Job Title <span className="text-slate-600 text-xs">(optional)</span>
        </Label>
        <Input
          value={form.jobTitle}
          onChange={patch('jobTitle')}
          placeholder="e.g. Event Coordinator"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-10"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-red-400 overflow-hidden"
          >
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400 overflow-hidden"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            Invitation sent successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
      >
        {loading
          ? <><Loader2 className="mr-2 size-4 animate-spin" />Sending…</>
          : <><UserPlus className="mr-2 size-4" />Send Invitation</>}
      </Button>
    </form>
  );
}
