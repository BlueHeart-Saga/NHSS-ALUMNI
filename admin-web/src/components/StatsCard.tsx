import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#F4C542'
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 sm:p-6 flex items-start justify-between gap-3 shadow-2xs hover:border-gray-300 transition-all min-w-0">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wider block truncate">{title}</span>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1.5 sm:mt-2 mb-0.5 sm:mb-1 tracking-tight break-all">{value}</div>
        {subtitle && <span className="text-[11px] sm:text-xs text-[#6B7280] leading-tight block truncate">{subtitle}</span>}
      </div>
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border border-[#E5E7EB] shrink-0"
        style={{ backgroundColor: '#FFF7D6' }}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111]" />
      </div>
    </div>
  );
};
