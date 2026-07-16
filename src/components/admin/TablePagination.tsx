import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  label: string;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  page,
  pages,
  total,
  pageSize,
  label,
  onPageChange,
}: TablePaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
      <p className="text-xs text-slate-500">
        Showing {from}–{to} of {total} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-7 px-3 text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40"
        >
          Prev
        </Button>
        <span className="text-xs text-slate-500 min-w-[3.5rem] text-center">
          {page} / {Math.max(pages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 px-3 text-xs border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
