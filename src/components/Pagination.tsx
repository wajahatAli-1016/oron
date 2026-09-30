import { useMemo } from 'react';
import { Button } from './UI';

type Props = {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  maxButtons?: number;
};

export const Pagination = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
  maxButtons = 5,
}: Props) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageButtons = useMemo(() => {
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [maxButtons, safePage, totalPages]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={safePage <= 1}
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
      >
        Previous
      </Button>

      {pageButtons.map((p) => (
        <Button
          key={p}
          variant={p === safePage ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
      >
        Next
      </Button>
    </div>
  );
};

