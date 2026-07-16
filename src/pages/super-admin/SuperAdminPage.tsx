import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, LogOut, RefreshCw, Loader2, Shield, ChevronRight, Mail,
  Briefcase, LayoutDashboard,
} from 'lucide-react';
import { InvitationForm } from '@/components/auth';
import { useAuthContext } from '@/context/useAuthContext';
import { URLS } from '@/utils/routes';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminRecord {
  id:              string;
  email:           string;
  firstName:       string;
  lastName:        string;
  jobTitle:        string | null;
  role:            'admin' | 'super_admin';
  isEmailVerified: boolean;
  createdAt:       string;
}

// ─── Admin list ───────────────────────────────────────────────────────────────

function AdminList({ admins, loading, onRefresh }: {
  admins: AdminRecord[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-400">
          {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
        </p>
        <button type="button" onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {loading && admins.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-slate-600" />
        </div>
      ) : admins.length === 0 ? (
        <p className="text-center text-sm text-slate-600 py-8">No admins yet.</p>
      ) : (
        <div className="space-y-2">
          {admins.map(a => (
            <div key={a.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/20 text-xs font-bold text-amber-400">
                  {a.firstName[0]}{a.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{a.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full border font-medium',
                  a.role === 'super_admin'
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                )}>
                  {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
                {!a.isEmailVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [admins,      setAdmins]      = useState<AdminRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await api.get<AdminRecord[]>('/admin/admins');
      setAdmins(data);
    } catch {
      // silently fail — list stays empty
    } finally { setListLoading(false); }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  async function handleLogout() {
    await logout();
    navigate(URLS.LOGIN);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="size-5 text-purple-400" />
            <span className="font-semibold text-white">Super Admin</span>
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-600">
              <ChevronRight className="size-3" /> Ogbonna Memorial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={URLS.ADMIN_DASHBOARD}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              <LayoutDashboard className="size-3.5" />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5">
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-semibold text-white">
            Welcome back, {user?.firstName ?? 'Super Admin'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage admin accounts and monitor platform activity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invite admin card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Mail className="size-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Invite Admin</h2>
                <p className="text-xs text-slate-500">Send an invitation email to a new admin</p>
              </div>
            </div>

            <InvitationForm onSuccess={fetchAdmins} />
          </motion.div>

          {/* Admin list card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Users className="size-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Admin Accounts</h2>
                <p className="text-xs text-slate-500">All registered admins</p>
              </div>
            </div>
            <AdminList admins={admins} loading={listLoading} onRefresh={fetchAdmins} />
          </motion.div>
        </div>

        {/* Quick stats footer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: Users,     label: 'Total Admins',    value: admins.length,                     color: 'text-blue-400' },
            { icon: Briefcase, label: 'Verified',        value: admins.filter(a => a.isEmailVerified).length, color: 'text-emerald-400' },
            { icon: Mail,      label: 'Pending Invite',  value: admins.filter(a => !a.isEmailVerified).length, color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <stat.icon className={cn('size-4 shrink-0', stat.color)} />
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
