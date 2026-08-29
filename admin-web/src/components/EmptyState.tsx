import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center flex flex-col items-center justify-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF7D6] border border-[#F4C542]/50 flex items-center justify-center mb-4 text-[#111111]">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#111111]">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-sm mt-1 mb-6">{description}</p>
      {action}
    </div>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <div className="p-12 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-3 border-[#F4C542] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-[#6B7280] font-medium">Loading data...</span>
    </div>
  );
};
