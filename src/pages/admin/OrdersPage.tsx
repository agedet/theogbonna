import { OrdersTable } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';

export default function OrdersPage() {
  const { user } = useAuthContext();
  const canSoftDelete = user?.role === 'admin' || user?.role === 'super_admin';
  const canDelete     = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {canDelete
            ? 'Update order status, archive, or permanently delete orders.'
            : canSoftDelete
              ? 'Update order status or archive orders.'
              : 'Update order status.'}
        </p>
      </div>
      <OrdersTable canSoftDelete={canSoftDelete} canDelete={canDelete} />
    </div>
  );
}
