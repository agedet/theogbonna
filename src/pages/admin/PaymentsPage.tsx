import { PaymentsTable } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';

export default function PaymentsPage() {
  const { user } = useAuthContext();
  const canSoftDelete = user?.role === 'admin' || user?.role === 'super_admin';
  const canDelete     = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {canDelete
            ? 'Update payment status, archive, or permanently delete payments.'
            : canSoftDelete
              ? 'Update payment status or archive payments.'
              : 'Review transactions and update payment status.'}
        </p>
      </div>
      <PaymentsTable canSoftDelete={canSoftDelete} canDelete={canDelete} />
    </div>
  );
}
