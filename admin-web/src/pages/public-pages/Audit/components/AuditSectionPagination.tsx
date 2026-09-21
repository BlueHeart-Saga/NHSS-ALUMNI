import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const AuditSectionPagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="px-4 py-3 bg-[#FAFAFA] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
      <span>
        Showing <strong className="text-[#111111]">{startItem}</strong> - <strong className="text-[#111111]">{endItem}</strong> of <strong className="text-[#111111]">{totalItems}</strong>
      </span>
      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-7 px-2 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              page === currentPage
                ? 'border-[#F4C542] bg-[#FFF7D6] text-[#854D0E]'
                : 'border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-100'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
