import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Loader2, ChevronDown, ExternalLink, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  canDelete?: boolean;
}

export function OrdersTable({ onChanged, canDelete = false }: OrdersTableProps) {
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

  async function deleteOrder(orderId: string) {
    if (!window.confirm('Delete this order and its related payments? This cannot be undone.')) {
      return;
    }
    setBusyId(orderId);
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

  const colSpan = canDelete ? 7 : 7;

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
            placeholder="Search name, email, phone, ref…"
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
            <option value="" className="bg-slate-900">
              All Statuses
            </option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s} className="bg-slate-900">
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
                {['Customer', 'Qty', 'Total', 'Delivery', 'Receipt', 'Status', 'Actions'].map(h => (
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
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center">
                    <Loader2 className="size-5 animate-spin text-slate-600 mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-600 text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{o.fullName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{o.email}</p>
                      <p className="text-xs text-slate-600">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{o.quantity}</td>
                    <td className="px-4 py-3 font-medium text-amber-400">£{o.totalPrice}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{o.deliveryOption}</td>
                    <td className="px-4 py-3">
                      {o.receiptUrl ? (
                        <a
                          href={o.receiptUrl}
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
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      {busyId === o.id ? (
                        <Loader2 className="size-4 animate-spin text-slate-500" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={o.status}
                            onChange={e => void updateStatus(o.id, e.target.value)}
                            className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 max-w-[140px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s} className="bg-slate-900">
                                {formatStatusLabel(s)}
                              </option>
                            ))}
                          </select>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void deleteOrder(o.id)}
                              title="Delete order"
                              className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
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
