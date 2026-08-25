import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, RefreshCw, Loader2, ChevronDown, ExternalLink, Trash2, Eye, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConfirmDialog } from '@/components/ui/use-confirm-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { TablePagination } from './TablePagination';
import {
  ORDER_STATUSES,
  PAGE_SIZE,
  formatStatusLabel,
  type Order,
  type Paginated,
} from './types';

interface OrdersTableProps {
  onChanged?: () => void;
  /** Regular admin and super_admin can soft-delete (archive). */
  canSoftDelete?: boolean;
  /** Hard (permanent) delete — super_admin only. */
  canDelete?: boolean;
}

function orderDetailPath(pathname: string, id: string) {
  const base = pathname.startsWith('/super-admin') ? '/super-admin/orders' : '/admin/orders';
  return `${base}/${id}`;
}

export function OrdersTable({ onChanged, canSoftDelete = false, canDelete = false }: OrdersTableProps) {
  const location = useLocation();
  const { confirm, dialog } = useConfirmDialog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);
      const res = await api.get<Paginated<Order>>(`/admin/orders?${params}`);
      setOrders(res.data);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  async function updateStatus(orderId: string, status: string) {
    const ok = await confirm({
      title: 'Update order status?',
      description: `Change this order to “${formatStatusLabel(status)}”? Linked payment status will update to match.`,
      confirmLabel: 'Update status',
    });
    if (!ok) return;

    setBusyId(orderId);
    setError(null);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      await fetchOrders();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function softDeleteOrder(orderId: string) {
    const ok = await confirm({
      title: 'Delete order?',
      description: 'Delete this order? It will be deleted.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    setBusyId(`${orderId}:soft`);
    setError(null);
    try {
      await api.patch(`/admin/orders/${orderId}/soft-delete`, {});
      await fetchOrders();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive order');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteOrder(orderId: string) {
    const ok = await confirm({
      title: 'Permanently delete order?',
      description: 'This will permanently delete the order and its related payments. This cannot be undone.',
      confirmLabel: 'Delete order',
      variant: 'destructive',
    });
    if (!ok) return;

    setBusyId(`${orderId}:delete`);
    setError(null);
    try {
      await api.delete(`/admin/orders/${orderId}`);
      await fetchOrders();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone, ref…"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-background border-input text-foreground placeholder:text-muted-foreground h-9 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={e => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-border bg-background text-sm text-foreground px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="">
              All Statuses
            </option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>
                {formatStatusLabel(s)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => void fetchOrders()}
          title="Refresh"
          className="flex items-center justify-center size-9 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground">
                {['Customer', 'Qty', 'Total', 'Date', 'Receipt', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-background uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="bg-white hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={orderDetailPath(location.pathname, o.id)}
                        className="font-bold text-foreground hover:text-amber-600 transition-colors"
                      >
                        {o.fullName}
                      </Link>
                      <p className="text-xs text-foreground mt-0.5">{o.email}</p>
                      <p className="text-xs text-foreground">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{o.quantity}</td>
                    <td className="px-4 py-3 font-medium text-amber-900">£{o.totalPrice}</td>
                    <td className="px-4 py-3 text-foreground text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {o.receiptUrl ? (
                        <a
                          href={o.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      {busyId?.startsWith(o.id) ? (
                        <Loader2 className="size-4 animate-spin text-foreground" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Link
                            to={orderDetailPath(location.pathname, o.id)}
                            title="View details"
                            className="flex items-center gap-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors px-3 py-1"
                          >
                            <Eye className="size-3.5" /> View
                          </Link>
                          <select
                            value={o.status}
                            onChange={e => void updateStatus(o.id, e.target.value)}
                            className="text-xs bg-background border border-border text-foreground rounded-lg px-3 py-1 max-w-[140px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s}>
                                {formatStatusLabel(s)}
                              </option>
                            ))}
                          </select>

                          <div className='flex items-center gap-4'>
                            <div>
                              {/* Soft delete — admin + super_admin */}
                              {canSoftDelete && (
                                <button
                                  type="button"
                                  onClick={() => void softDeleteOrder(o.id)}
                                  title="Archive order"
                                  className="flex items-center gap-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors px-3 py-1"
                                >
                                  <Archive className="size-3.5" /> Delete
                                </button>
                              )}
                            </div>

                            <div>
                              {/* Hard delete — super_admin only */}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => void deleteOrder(o.id)}
                                  title="Permanently delete order"
                                  className="flex items-center gap-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors px-3 py-1"
                                >
                                  <Trash2 className="size-3.5" /> Delete
                                </button>
                              )}
                              </div>
                          </div>
                        </div>
                      )}
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
          label="orders"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
