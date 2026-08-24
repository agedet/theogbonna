import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConfirmDialog } from '@/components/ui/use-confirm-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { TablePagination } from './TablePagination';
import { PAGE_SIZE, type Attendee, type Paginated } from './types';

interface AttendeesTableProps {
  /** Regular admin and super_admin can soft-delete (archive). */
  canSoftDelete?: boolean;
  /** Hard (permanent) delete — super_admin only. */
  canDelete?: boolean;
}

export function AttendeesTable({ canSoftDelete = false, canDelete = false }: AttendeesTableProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  // Encodes both the record id and the action: "<id>:soft" | "<id>:delete"
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set('search', search);
      const res = await api.get<Paginated<Attendee>>(`/admin/attendees?${params}`);
      setAttendees(res.data);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendees');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchAttendees();
  }, [fetchAttendees]);

  async function softDeleteAttendee(id: string, email: string) {
    const ok = await confirm({
      title: 'Archive attendee?',
      description: `Archive ${email}? The record will be hidden from normal views but can be restored by a super admin.`,
      confirmLabel: 'Archive',
    });
    if (!ok) return;

    setBusyId(`${id}:soft`);
    setError(null);
    try {
      await api.patch(`/admin/attendees/${id}/soft-delete`, {});
      await fetchAttendees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive attendee');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAttendee(id: string, email: string) {
    const ok = await confirm({
      title: 'Permanently delete attendee?',
      description: `Delete ${email}? Related payments will be removed and orders unlinked. This cannot be undone.`,
      confirmLabel: 'Delete attendee',
      variant: 'destructive',
    });
    if (!ok) return;

    setBusyId(`${id}:delete`);
    setError(null);
    try {
      await api.delete(`/admin/attendees/${id}`);
      await fetchAttendees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attendee');
    } finally {
      setBusyId(null);
    }
  }

  const hasActions = canSoftDelete || canDelete;
  const colSpan = hasActions ? 6 : 5;

  return (
    <div className="space-y-3">
      {dialog}
      {error && (
        <p className="text-xs text-red-400 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
          <Input
            placeholder="Search name, email, city…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white/5 border-foreground/50 text-foreground placeholder:text-slate-600 h-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void fetchAttendees()}
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
              <tr className="border-b border-white/[0.06] bg-foreground">
                {[
                  'Name',
                  'Email',
                  'Location',
                  'Orders',
                  'Joined',
                  ...(hasActions ? ['Actions'] : []),
                ].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-background uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading && attendees.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center">
                    <Loader2 className="size-5 animate-spin text-foreground mx-auto" />
                  </td>
                </tr>
              ) : attendees.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center text-foreground text-sm">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                attendees.map(a => (
                  <tr key={a.id} className="hover:bg-sidebar transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {a.firstName} {a.lastName}
                    </td>
                    <td className="px-4 py-3 text-foreground/95 text-xs">{a.email}</td>
                    <td className="px-4 py-3 text-foreground/95 text-xs">
                      {[a.city, a.state, a.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground">{a._count?.orders ?? 0}</td>
                    <td className="px-4 py-3 text-foreground/95 text-xs whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    {hasActions && (
                      <td className="px-4 py-3">
                        {busyId?.startsWith(a.id) ? (
                          <Loader2 className="size-4 animate-spin text-foreground/90" />
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* Soft delete — admin + super_admin */}
                            {canSoftDelete && (
                              <button
                                type="button"
                                onClick={() => void softDeleteAttendee(a.id, a.email)}
                                title="Archive attendee"
                                className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                            {/* Hard delete — super_admin only */}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => void deleteAttendee(a.id, a.email)}
                                title="Permanently delete attendee"
                                className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
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
          label="attendees"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
