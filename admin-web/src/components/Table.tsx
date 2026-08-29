import React from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
}

export function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border border-[#E5E7EB] rounded-2xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] text-sm text-[#111111]">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-[#FAFAFA] transition-colors">
              {columns.map((col, idx) => (
                <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
