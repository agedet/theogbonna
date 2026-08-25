import { AttendeesTable } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';

export default function AttendeesPage() {
  const { user } = useAuthContext();
  const canSoftDelete = user?.role === 'admin' || user?.role === 'super_admin';
  const canDelete     = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Attendees</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {canDelete
            ? 'Archive or permanently delete memorial attendees.'
            : canSoftDelete
              ? 'View and archive memorial attendees.'
              : 'View memorial order attendees.'}
        </p>
      </div>
      <AttendeesTable canSoftDelete={canSoftDelete} canDelete={canDelete} />
    </div>
  );
}
