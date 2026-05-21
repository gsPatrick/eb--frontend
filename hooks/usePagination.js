import { useCallback, useEffect, useMemo, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export function usePagination(items = [], initialPageSize = 5) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const resetPage = useCallback(() => setPage(1), []);

  const paginationProps = {
    embedded: true,
    page,
    pageSize,
    totalItems: items.length,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onPageChange: setPage,
    onPageSizeChange: handlePageSizeChange,
  };

  return {
    page,
    pageSize,
    totalPages,
    paginatedItems,
    paginationProps,
    resetPage,
  };
}
