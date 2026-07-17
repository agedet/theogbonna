import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UsersRound,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import { useAuthContext } from '@/context/useAuthContext';
import { URLS } from '@/utils/routes';

const LINKS = [
  {
    title: 'User Management',
    description: 'Invite admins, edit roles, delete accounts',
    url: URLS.SUPER_ADMIN_USER_MANAGEMENT,
    icon: Users,
    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  },
  {
    title: 'Attendees',
    description: 'View and delete memorial attendees',
    url: URLS.SUPER_ADMIN_ATTENDEES,
    icon: UsersRound,
    color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  },
  {
    title: 'Orders',
    description: 'Update status or delete orders',
    url: URLS.SUPER_ADMIN_ORDERS,
    icon: ShoppingCart,
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  {
    title: 'Payments',
    description: 'Review and update payment status',
    url: URLS.SUPER_ADMIN_PAYMENTS,
    icon: CreditCard,
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
];

export default function SuperAdminPage() {
  const { user } = useAuthContext();

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-foreground">
            Welcome back, {user?.firstName ?? ''}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage users, attendees, orders, and payments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map((item, i) => (
          <motion.div
            key={item.url}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to={item.url}
              className="block rounded-2xl border border-border bg-card p-5 hover:bg-muted transition-colors h-full"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl border mb-3 ${item.color}`}>
                <item.icon className="size-4" />
              </div>
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
