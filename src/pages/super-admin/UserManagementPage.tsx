import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { InvitationForm } from '@/components/auth';
import { UsersTable } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';

export default function UserManagementPage() {
  const { user } = useAuthContext();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Invite admins, change roles, or delete accounts.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-border bg-card p-6 max-w-xl space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Mail className="size-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Invite Admin</h2>
            <p className="text-xs text-muted-foreground">Send an invitation email to a new admin</p>
          </div>
        </div>
        <InvitationForm onSuccess={() => setRefreshKey(k => k + 1)} />
      </motion.div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Admin accounts</h2>
        <UsersTable key={refreshKey} currentUserId={user?.id} />
      </div>
    </div>
  );
}
