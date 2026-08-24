import { useCallback, useEffect, useState } from 'react';
import {
  Search, RefreshCw, Loader2, Trash2,
  ExternalLink, X, User, MapPin, ShoppingBag, CreditCard,
  Archive,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { useConfirmDialog } from '@/components/ui/use-confirm-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { TablePagination } from './TablePagination';
import { PAGE_SIZE, type Attendee, type Order, type Paginated, type Transaction } from './types';

// ─── Detail sheet ──────────────────────────────────────────────────────────────

interface AttendeeDetail {
  attendee: Attendee;
  orders:   Order[];
  payments: Transaction[];
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground break-all sm:text-right">
        {value ?? '—'}
      </span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 pb-1 border-b border-border">
        <Icon className="size-3.5 text-amber-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function AttendeeDetailSheet({
  open, onClose, detail, loading, error,
}: {
  open: boolean;
  onClose: () => void;
  detail: AttendeeDetail | null;
  loading: boolean;
  error: string | null;
}) {
  const a = detail?.attendee;

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto bg-background border-l border-border p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 flex flex-row items-center justify-between bg-background border-b border-border px-5 py-4">
          <SheetTitle className="text-base font-semibold text-foreground">
            {a ? `${a.firstName} ${a.lastName}` : 'Attendee Details'}
          </SheetTitle>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="px-5 py-5 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && !loading && (
            <p className="text-sm text-red-400 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
              {error}
            </p>
          )}

          {!loading && !error && a && (
            <>
              {/* Personal info */}
              <Section icon={User} title="Personal Details">
                <DetailRow label="Full Name"  value={`${a.firstName} ${a.lastName}`} />
                <DetailRow label="Email"      value={a.email} />
                <DetailRow label="Joined" value={
                  new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                } />
              </Section>

              {/* Location */}
              <Section icon={MapPin} title="Location">
                <DetailRow label="City"    value={a.city} />
                <DetailRow label="State"   value={a.state} />
                <DetailRow label="Country" value={a.country} />
                <DetailRow label="Delivery Address" value={a.deliveryAddress} />
              </Section>

              {/* Orders */}
              <Section icon={ShoppingBag} title={`Orders (${detail.orders.length})`}>
                {detail.orders.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No orders found.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {detail.orders.map(o => (
                      <div key={o.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-muted-foreground truncate">{o.id}</span>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground font-medium">£{o.totalPrice}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Qty: {o.quantity}</span>
                          <span>{o.deliveryOption.replace(/_/g, ' ')}</span>
                        </div>
                        {o.receiptUrl && (
                          <a
                            href={o.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            View receipt <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Payments */}
              <Section icon={CreditCard} title={`Payments (${detail.payments.length})`}>
                {detail.payments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No payments found.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {detail.payments.map(t => (
                      <div key={t.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-muted-foreground truncate">{t.reference}</span>
                          <StatusBadge status={t.status} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground font-medium">
                            {t.currency === 'GBP' ? '£' : '₦'}{t.amount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {(t.receiptUrl ?? t.orders?.receiptUrl) && (
                          <a
                            href={t.receiptUrl ?? t.orders?.receiptUrl ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            View receipt <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────────

interface AttendeesTableProps {
  /** Regular admin and super_admin can soft-delete (archive). */
  canSoftDelete?: boolean;
  /** Hard (permanent) delete — super_admin only. */
  canDelete?: boolean;
}

export function AttendeesTable({ canSoftDelete = false, canDelete = false }: AttendeesTableProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [meta, setMeta]           = useState({ total: 0, pages: 1 });
  // Encodes both the record id and the action: "<id>:soft" | "<id>:delete"
  const [busyId, setBusyId]       = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  // Detail sheet state
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [sheetDetail, setSheetDetail]   = useState<AttendeeDetail | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError]     = useState<string | null>(null);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
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

  useEffect(() => { void fetchAttendees(); }, [fetchAttendees]);

  async function openDetail(a: Attendee) {
    setSheetOpen(true);
    setSheetError(null);
    setSheetDetail(null);
    setSheetLoading(true);
    try {
      // Fetch orders and payments for this attendee in parallel using email search
      const [ordersRes, paymentsRes] = await Promise.all([
        api.get<Paginated<Order>>(`/admin/orders?search=${encodeURIComponent(a.email)}&limit=50`),
        api.get<Paginated<Transaction>>(`/admin/payments?search=${encodeURIComponent(a.email)}&limit=50`),
      ]);
      setSheetDetail({
        attendee: a,
        orders:   ordersRes.data,
        payments: paymentsRes.data,
      });
    } catch (err) {
      setSheetError(err instanceof Error ? err.message : 'Failed to load attendee details');
    } finally {
      setSheetLoading(false);
    }
  }

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
      setSheetOpen(false);
      await fetchAttendees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attendee');
    } finally {
      setBusyId(null);
    }
  }

  const hasActions = canSoftDelete || canDelete;
  const colSpan    = hasActions ? 6 : 5;

  return (
    <div className="space-y-3">
      {dialog}

      <AttendeeDetailSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        detail={sheetDetail}
        loading={sheetLoading}
        error={sheetError}
      />

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
            onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                  'Name', 'Email', 'Location', 'Orders', 'Joined',
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
            <tbody className="divide-y divide-border">
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
                  <tr key={a.id} className="bg-white hover:bg-muted/40 transition-colors">
                    {/* Clickable name opens detail sheet */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void openDetail(a)}
                        className="font-medium text-amber-600  hover:text-amber-600 transition-colors text-left cursor-pointer"
                      >
                        {a.firstName} {a.lastName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground/95 text-xs">{a.email}</td>
                    <td className="px-4 py-3 text-foreground/95 text-xs">
                      {[a.city, a.state, a.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground">{a._count?.orders ?? 0}</td>
                    <td className="px-4 py-3 text-foreground/95 text-xs whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
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
                                className="flex items-center gap-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors px-3 py-1"
                              >
                                <Archive className="size-3.5" /> Delete
                              </button>
                            )}
                            {/* Hard delete — super_admin only */}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => void deleteAttendee(a.id, a.email)}
                                title="Permanently delete attendee"
                                className="flex items-center gap-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors px-3 py-1"
                              >
                                <Trash2 className="size-3.5" /> Delete
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
