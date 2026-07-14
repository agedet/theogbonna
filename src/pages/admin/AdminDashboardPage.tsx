import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, CreditCard, TrendingUp, Clock,
  CheckCircle2, XCircle, Search, RefreshCw,
  LogOut, Loader2, ChevronDown, ExternalLink,
  Shield, LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id:             string;
  fullName:       string;
  email:          string;
  phone:          string;
  quantity:       number;
  totalPrice:     number;
  deliveryOption: string;
  deliveryAddress?: string | null;
  deliveryState?:  string | null;
  paymentRef?:     string | null;
  receiptUrl?:     string | null;
  status:         string;
  createdAt:      string;
  attendees?:     { firstName: string; lastName: string } | null;
  transactions:   Transaction[];
}

interface Transaction {
  id:        string;
  amount:    number;
  currency:  string;
  reference: string;
  status:    string;
  receiptUrl?: string | null;
  createdAt: string;
  attendees?: { firstName: string; lastName: string; email: string } | null;
  orders?:    { id: string; fullName: string; totalPrice: number; receiptUrl?: string | null } | null;
}

interface Stats {
  orders:   { total: number; pending: number; confirmed: number };
  payments: { total: number; pending: number; success: number; revenue: number };
}

interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/10 border-red-500/20 text-red-400',
  SUCCESS:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  FAILED:    'bg-red-500/10 border-red-500/20 text-red-400',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
      STATUS_STYLES[status] ?? 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    )}>
      <span className="size-1.5 rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color, delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; sub?: string;
  color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay ?? 0 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <div className={cn('flex size-9 items-center justify-center rounded-xl border', color)}>
          <Icon className="size-4" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Orders table ─────────────────────────────────────────────────────────────

function OrdersTable({ onStatusUpdate }: { onStatusUpdate: () => void }) {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('');
  const [page,     setPage]     = useState(1);
  const [meta,     setMeta]     = useState({ total: 0, pages: 1 });
  const [updating, setUpdating] = useState<string | null>(null);

  const ORDER_STATUSES = ['', 'PENDING', 'CONFIRMED', 'CANCELLED'];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);
      const res = await api.get<Paginated<Order>>(`/admin/orders?${params}`);
      setOrders(res.data);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
    } catch { /* leave as is */ }
    finally  { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      await fetchOrders();
      onStatusUpdate();
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
          <Input
            placeholder="Search name, email, phone, ref…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-9 text-sm"
          />
        </div>
        <div className="relative">
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-white px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer">
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s} className="bg-slate-900">
                {s || 'All Statuses'}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
        <button onClick={fetchOrders} title="Refresh"
          className="flex items-center justify-center size-9 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0">
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Customer', 'Qty', 'Total', 'Delivery', 'Payment Ref', 'Receipt', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading && orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center">
                  <Loader2 className="size-5 animate-spin text-slate-600 mx-auto" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-600 text-sm">
                  No orders found.
                </td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{o.fullName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{o.email}</p>
                    <p className="text-xs text-slate-600">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{o.quantity}</td>
                  <td className="px-4 py-3 font-medium text-amber-400">£{o.totalPrice}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{o.deliveryOption}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{o.paymentRef ?? '—'}</td>
                  <td className="px-4 py-3">
                    {o.receiptUrl ? (
                      <a href={o.receiptUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        View <ExternalLink className="size-3" />
                      </a>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      {updating === o.id ? (
                        <Loader2 className="size-4 animate-spin text-slate-500" />
                      ) : (
                        <select
                          defaultValue={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        >
                          {['PENDING', 'CONFIRMED', 'CANCELLED'].map(s => (
                            <option key={s} value={s} className="bg-slate-900">{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-xs text-slate-500">{meta.total} orders total</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-7 px-3 text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                Prev
              </Button>
              <span className="text-xs text-slate-500">{page} / {meta.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.pages}
                onClick={() => setPage(p => p + 1)}
                className="h-7 px-3 text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payments table ───────────────────────────────────────────────────────────

function PaymentsTable() {
  const [txns,    setTxns]    = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');
  const [page,    setPage]    = useState(1);
  const [meta,    setMeta]    = useState({ total: 0, pages: 1 });

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);
      const res = await api.get<Paginated<Transaction>>(`/admin/payments?${params}`);
      setTxns(res.data);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
    } catch { /* leave as is */ }
    finally  { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
          <Input placeholder="Search reference or email…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-9 text-sm" />
        </div>
        <div className="relative">
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-white px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer">
            {['', 'PENDING', 'SUCCESS', 'FAILED'].map(s => (
              <option key={s} value={s} className="bg-slate-900">{s || 'All'}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
        </div>
        <button onClick={fetchTxns} title="Refresh"
          className="flex items-center justify-center size-9 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0">
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Buyer', 'Reference', 'Amount', 'Currency', 'Receipt', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading && txns.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <Loader2 className="size-5 animate-spin text-slate-600 mx-auto" />
                </td></tr>
              ) : txns.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600 text-sm">
                  No transactions found.
                </td></tr>
              ) : txns.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    {t.attendees ? (
                      <>
                        <p className="font-medium text-white">
                          {t.attendees.firstName} {t.attendees.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{t.attendees.email}</p>
                      </>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.reference}</td>
                  <td className="px-4 py-3 font-medium text-amber-400">
                    {t.currency === 'GBP' ? '£' : '₦'}{t.amount}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.currency}</td>
                  <td className="px-4 py-3">
                    {t.receiptUrl || t.orders?.receiptUrl ? (
                      <a href={t.receiptUrl ?? t.orders?.receiptUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        View <ExternalLink className="size-3" />
                      </a>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-xs text-slate-500">{meta.total} transactions total</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-7 px-3 text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10">Prev</Button>
              <span className="text-xs text-slate-500">{page} / {meta.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.pages}
                onClick={() => setPage(p => p + 1)}
                className="h-7 px-3 text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'orders' | 'payments';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [tab,     setTab]     = useState<Tab>('orders');

  const fetchStats = useCallback(async () => {
    try { setStats(await api.get<Stats>('/admin/stats')); }
    catch { /* silently */ }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/admin/login'); return; }
    fetchStats();
  }, [authLoading, user, navigate, fetchStats]);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-5 text-amber-400" />
            <span className="font-semibold text-white">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Link to="/super-admin"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-500/5">
                <Shield className="size-3.5" />
                <span className="hidden sm:inline">Super Admin</span>
              </Link>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5">
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Welcome, {user?.firstName ?? 'Admin'}
            </h1>
            <p className="text-slate-500 text-sm">Ogbonna Memorial — Asoebi Orders</p>
          </div>
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full border font-medium',
            isSuperAdmin
              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          )}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats?.orders.total ?? '—'}
            sub={`${stats?.orders.pending ?? 0} pending`}
            color="bg-amber-500/10 border-amber-500/20 text-amber-400"
            delay={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="Confirmed"
            value={stats?.orders.confirmed ?? '—'}
            color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            delay={0.05}
          />
          <StatCard
            icon={CreditCard}
            label="Payments"
            value={stats?.payments.total ?? '—'}
            sub={`${stats?.payments.pending ?? 0} pending`}
            color="bg-blue-500/10 border-blue-500/20 text-blue-400"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={stats ? `£${stats.payments.revenue.toLocaleString()}` : '—'}
            sub="verified payments"
            color="bg-purple-500/10 border-purple-500/20 text-purple-400"
            delay={0.15}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {(['orders', 'payments'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                tab === t
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}>
              {t === 'orders' ? (
                <span className="flex items-center gap-1.5"><ShoppingBag className="size-3.5" /> Orders</span>
              ) : (
                <span className="flex items-center gap-1.5"><CreditCard className="size-3.5" /> Payments</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'orders'
            ? <OrdersTable onStatusUpdate={fetchStats} />
            : <PaymentsTable />
          }
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pb-4">
          {[
            { icon: Clock,        label: 'Pending',   color: 'text-yellow-400' },
            { icon: CheckCircle2, label: 'Confirmed', color: 'text-emerald-400' },
            { icon: XCircle,      label: 'Cancelled', color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-600">
              <s.icon className={cn('size-3', s.color)} />
              {s.label}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
