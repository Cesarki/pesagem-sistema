import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onGoToPage: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onGoToPage,
  onNextPage,
  onPrevPage,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{startItem}</span> a{' '}
        <span className="font-semibold">{endItem}</span> de{' '}
        <span className="font-semibold">{totalItems}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onGoToPage(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Próxima
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Página <span className="font-semibold">{currentPage}</span> de{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>
    </div>
  );
};
