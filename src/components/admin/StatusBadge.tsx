import { cn } from '@/lib/utils';
import { formatStatusLabel } from './types';

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
  needs_review: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  awaiting_payment: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  payment_proof_received: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  payment_verified: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  processing: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  ready_for_dispatch: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  assigned_to_delivery: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  out_for_delivery: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  delivered: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  closed: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  cancelled: 'bg-red-500/10 border-red-500/20 text-red-400',
  PENDING: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  SUCCESS: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  FAILED: 'bg-red-500/10 border-red-500/20 text-red-400',
  CONFIRMED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/10 border-red-500/20 text-red-400',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_STYLES[status] ?? 'bg-slate-500/10 border-slate-500/20 text-slate-400',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatusLabel(status)}
    </span>
  );
}
