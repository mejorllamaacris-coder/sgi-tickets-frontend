// src/shared/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationOptions<T> {
  data: T[];
  pageSize?: number;
}

export function usePagination<T>({ data, pageSize = 10 }: UsePaginationOptions<T>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const next = () => goTo(page + 1);
  const prev = () => goTo(page - 1);

  // Reset a página 1 cuando cambia la data
  const reset = () => setPage(1);

  return { paginated, page, totalPages, goTo, next, prev, reset };
}