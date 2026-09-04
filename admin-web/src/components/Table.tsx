import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  defaultPageSize?: number;
  showPagination?: boolean;
}

export function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  defaultPageSize = 15,
  showPagination = true 
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 1 if data length changes
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pageData = useMemo(() => {
    if (!showPagination) return data;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize, showPagination]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="w-full border border-[#E5E7EB] rounded-2xl bg-white shadow-2xs overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-3.5 sm:px-6 py-2.5 sm:py-3.5 whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-xs sm:text-sm text-[#111111]">
            {pageData.length > 0 ? (
              pageData.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-[#FAFAFA] transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-3.5 sm:px-6 py-3 sm:py-4 ${col.className || ''}`}>
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 sm:px-6 py-8 sm:py-10 text-center text-gray-400 text-xs italic">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && totalItems > 0 && (
        <div className="px-3.5 sm:px-6 py-3 bg-[#FAFAFA] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
            <span>
              Showing <strong className="text-[#111111]">{startItem}</strong> - <strong className="text-[#111111]">{endItem}</strong> of <strong className="text-[#111111]">{totalItems}</strong> entries
            </span>
            <div className="flex items-center space-x-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#F4C542] text-[#111111] font-semibold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#111111] bg-white border border-[#E5E7EB] rounded-lg text-xs whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
