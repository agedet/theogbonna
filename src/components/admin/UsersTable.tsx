import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConfirmDialog } from '@/components/ui/use-confirm-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { TablePagination } from './TablePagination';
import { PAGE_SIZE, type AdminRecord, type Paginated } from './types';

interface UsersTableProps {
  currentUserId?: string;
  onChanged?: () => void;
}

export function UsersTable({ currentUserId, onChanged }: UsersTableProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set('search', search);
      const res = await api.get<Paginated<AdminRecord>>(`/admin/admins?${params}`);
      setAdmins(res.data);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  async function updateRole(id: string, role: 'admin' | 'super_admin') {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/admin/admins/${id}/role`, { role });
      await fetchAdmins();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAdmin(admin: AdminRecord) {
    const ok = await confirm({
      title: 'Delete admin?',
      description: `Delete ${admin.firstName} ${admin.lastName} (${admin.email})? They will no longer be able to sign in.`,
      confirmLabel: 'Delete admin',
      variant: 'destructive',
    });
    if (!ok) return;

    setBusyId(admin.id);
    setError(null);
    try {
      await api.delete(`/admin/admins/${admin.id}`);
      await fetchAdmins();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setBusyId(null);
    }
  }

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
            placeholder="Search name or email…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => void fetchAdmins()}
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
                {['Name', 'Email', 'Job title', 'Status', 'Role', 'Actions'].map(h => (
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
              {loading && admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <Loader2 className="size-5 animate-spin text-slate-600 mx-auto" />
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-600 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                admins.map(a => {
                  const isSelf = a.id === currentUserId;
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {a.firstName} {a.lastName}
                          {isSelf ? (
                            <span className="text-slate-500 font-normal"> (you)</span>
                          ) : null}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{a.email}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{a.jobTitle ?? '—'}</td>
                      <td className="px-4 py-3">
                        {a.isEmailVerified ? (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {busyId === a.id ? (
                          <Loader2 className="size-4 animate-spin text-slate-500" />
                        ) : isSelf ? (
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full border font-medium',
                              a.role === 'super_admin'
                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                            )}
                          >
                            {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={a.role}
                              onChange={e =>
                                void updateRole(a.id, e.target.value as 'admin' | 'super_admin')
                              }
                              className="h-8 rounded-lg border border-white/10 bg-white/5 text-xs text-white px-2 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                            >
                              <option value="admin" className="bg-slate-900">
                                Admin
                              </option>
                              <option value="super_admin" className="bg-slate-900">
                                Super Admin
                              </option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : busyId === a.id ? (
                          <Loader2 className="size-4 animate-spin text-slate-500" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => void deleteAdmin(a)}
                            title="Delete user"
                            className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          pages={meta.pages}
          total={meta.total}
          pageSize={PAGE_SIZE}
          label="users"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
