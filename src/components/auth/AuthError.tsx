import { AlertCircle } from 'lucide-react';

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-red-400">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  );
}
