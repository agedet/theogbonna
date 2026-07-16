import { AttendeesTable } from '@/components/admin';
import { useAuthContext } from '@/context/useAuthContext';

export default function AttendeesPage() {
  const { user } = useAuthContext();
  const canDelete = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Attendees</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {canDelete
            ? 'View and delete memorial order attendees.'
            : 'View memorial order attendees.'}
        </p>
      </div>
      <AttendeesTable canDelete={canDelete} />
    </div>
  );
}
