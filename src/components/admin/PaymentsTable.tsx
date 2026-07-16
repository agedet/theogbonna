import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Loader2, ChevronDown, ExternalLink, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { TablePagination } from './TablePagination';
import { PAGE_SIZE, PAYMENT_STATUSES, type Paginated, type Transaction } from './types';

interface PaymentsTableProps {
  onChanged?: () => void;
  canDelete?: boolean;
}

export function PaymentsTable({ onChanged, canDelete = false }: PaymentsTableProps) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);
      const res = await api.get<Paginated<Transaction>>(`/admin/payments?${params}`);
      setTxns(res.data);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    void fetchTxns();
  }, [fetchTxns]);

  async function updateStatus(paymentId: string, status: string) {
    setBusyId(paymentId);
    setError(null);
    try {
      await api.patch(`/admin/payments/${paymentId}/status`, { status });
      await fetchTxns();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    } finally {
      setBusyId(null);
    }
  }

  async function deletePayment(paymentId: string) {
    if (!window.confirm('Delete this payment record? This cannot be undone.')) {
      return;
    }
    setBusyId(paymentId);
    setError(null);
    try {
      await api.delete(`/admin/payments/${paymentId}`);
      await fetchTxns();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-400 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
          <Input
            placeholder="Search reference or email…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-9 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-white px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
          >
            {['', ...PAYMENT_STATUSES].map(s => (
              <option key={s || 'all'} value={s} className="bg-slate-900">
                {s || 'All'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => void fetchTxns()}
          title="Refresh"
          className="flex items-center justify-center size-9 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Buyer', 'Reference', 'Amount', 'Receipt', 'Status', 'Actions', 'Date'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading && txns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <Loader2 className="size-5 animate-spin text-slate-600 mx-auto" />
                  </td>
                </tr>
              ) : txns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-600 text-sm">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                txns.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      {t.attendees ? (
                        <>
                          <p className="font-medium text-white">
                            {t.attendees.firstName} {t.attendees.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{t.attendees.email}</p>
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.reference}</td>
                    <td className="px-4 py-3 font-medium text-amber-400">
                      {t.currency === 'GBP' ? '£' : '₦'}
                      {t.amount}
                    </td>
                    <td className="px-4 py-3">
                      {t.receiptUrl || t.orders?.receiptUrl ? (
                        <a
                          href={t.receiptUrl ?? t.orders?.receiptUrl ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3">
                      {busyId === t.id ? (
                        <Loader2 className="size-4 animate-spin text-slate-500" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={t.status}
                            onChange={e => void updateStatus(t.id, e.target.value)}
                            className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          >
                            {PAYMENT_STATUSES.map(s => (
                              <option key={s} value={s} className="bg-slate-900">
                                {s}
                              </option>
                            ))}
                          </select>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void deletePayment(t.id)}
                              title="Delete payment"
                              className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          pages={meta.pages}
          total={meta.total}
          pageSize={PAGE_SIZE}
          label="payments"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
