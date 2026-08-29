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
    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex items-start justify-between shadow-sm hover:border-gray-300 transition-all">
      <div>
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{title}</span>
        <div className="text-3xl font-bold text-[#111111] mt-2 mb-1">{value}</div>
        {subtitle && <span className="text-xs text-[#6B7280]">{subtitle}</span>}
      </div>
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[#E5E7EB]"
        style={{ backgroundColor: '#FFF7D6' }}
      >
        <Icon className="w-6 h-6 text-[#111111]" />
      </div>
    </div>
  );
};
