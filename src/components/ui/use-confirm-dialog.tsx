import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirmDialog() {
  const [state, setState] = useState<
    (ConfirmOptions & { open: boolean; resolve: (value: boolean) => void }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open && state) {
      state.resolve(false);
      setState(null);
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!state) return;
    setLoading(true);
    state.resolve(true);
    setState(null);
    setLoading(false);
  };

  const dialog = state ? (
    <ConfirmDialog
      open={state.open}
      onOpenChange={handleOpenChange}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      loading={loading}
      onConfirm={handleConfirm}
    />
  ) : null;

  return { confirm, dialog };
}
