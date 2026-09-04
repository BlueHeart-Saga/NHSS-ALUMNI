import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-12 text-center flex flex-col items-center justify-center my-2 sm:my-4">
      <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center mb-3 sm:mb-4 text-[#111111] shrink-0">
        <Inbox className="w-6 sm:w-7 h-6 sm:h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#111111]">{title}</h3>
      <p className="text-xs sm:text-sm text-[#6B7280] max-w-sm mt-1 mb-4 sm:mb-6">{description}</p>
      {action}
    </div>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-3 animate-pulse">
      <div className="w-7 sm:w-8 h-7 sm:h-8 border-3 border-[#F4C542] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-[#6B7280] font-medium">Loading data...</span>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="w-full border border-[#E5E7EB] rounded-2xl bg-white p-3 sm:p-4 space-y-3 sm:space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-xl w-full"></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center space-x-3 sm:space-x-4 py-3 border-b border-gray-100 last:border-none">
          <div className="w-9 sm:w-10 h-9 sm:h-10 bg-gray-200 rounded-full shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-20 sm:w-24 shrink-0"></div>
          <div className="h-4 bg-gray-100 rounded w-12 sm:w-16 shrink-0"></div>
        </div>
      ))}
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="w-20 h-5 bg-gray-100 rounded-full"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          <div className="pt-4 border-t border-gray-100 flex justify-between">
            <div className="w-16 h-4 bg-gray-100 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatsGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="w-8 h-8 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};
