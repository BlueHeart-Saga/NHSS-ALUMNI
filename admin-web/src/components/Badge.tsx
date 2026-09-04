import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'PUBLISHED':
      case 'ATTENDING':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PENDING':
      case 'DRAFT':
      case 'MAYBE':
        return 'bg-[#FFF7D6] text-[#854D0E] border-[#F4C542]/60';
      case 'REJECTED':
      case 'CANCELLED':
      case 'DECLINED':
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${getStyles()}`}>
      {status}
    </span>
  );
};
