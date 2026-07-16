import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  CreditCard,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { OrdersTable, PaymentsTable, type Stats } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay?: number;
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

type Tab = 'orders' | 'payments';

export default function AdminDashboardPage() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>('orders');

  const fetchStats = useCallback(async () => {
    try {
      setStats(await api.get<Stats>('/admin/stats'));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">
          Welcome {user?.firstName ?? ''}
        </h1>
        <p className="text-slate-500 text-sm">Ogbonna Memorial — Asoebi Orders</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          label="Verified"
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

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {(['orders', 'payments'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              tab === t
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5',
            )}
          >
            {t === 'orders' ? (
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="size-3.5" /> Orders
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CreditCard className="size-3.5" /> Payments
              </span>
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === 'orders' ? (
          <OrdersTable onChanged={fetchStats} canDelete={isSuperAdmin} />
        ) : (
          <PaymentsTable onChanged={fetchStats} canDelete={isSuperAdmin} />
        )}
      </motion.div>
    </div>
  );
}
