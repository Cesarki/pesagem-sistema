import { useState, useMemo } from 'react';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

interface PaginationResult<T> {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const usePagination = <T,>(
  items: T[],
  itemsPerPage: number = 10
): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Garantir que a página atual não ultrapasse o total de páginas
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, validCurrentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    if (validCurrentPage < totalPages) {
      setCurrentPage(validCurrentPage + 1);
    }
  };

  const prevPage = () => {
    if (validCurrentPage > 1) {
      setCurrentPage(validCurrentPage - 1);
    }
  };

  return {
    currentPage: validCurrentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: validCurrentPage < totalPages,
    canGoPrev: validCurrentPage > 1,
  };
};
