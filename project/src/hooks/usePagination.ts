import { useState, useMemo } from 'react';

interface UsePaginationParams {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  offset: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;
  canGoNext: (totalPages: number) => boolean;
  canGoPrev: boolean;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
}: UsePaginationParams = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => Math.max(1, prev - 1));
  const goToFirstPage = () => setPage(1);
  const goToLastPage = (totalPages: number) => setPage(totalPages);

  const canGoNext = (totalPages: number) => page < totalPages;
  const canGoPrev = page > 1;

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev,
  };
}