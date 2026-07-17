import { OrdersTable } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';

export default function OrdersPage() {
  const { user } = useAuthContext();
  const canDelete = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {canDelete
            ? 'Update order status or delete orders.'
            : 'Update order status.'}
        </p>
      </div>
      <OrdersTable canDelete={canDelete} />
    </div>
  );
}
