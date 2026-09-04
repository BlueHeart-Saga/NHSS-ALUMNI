import React from 'react';
import { Users, GraduationCap, Calendar, Award } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { StatsSkeleton } from './SkeletonLoaders';

interface StatsProps {
  totalAlumni: number;
  totalBatches: number;
  totalEvents: number;
  yearsConnected: number;
  loading?: boolean;
}

export const CommunityStats: React.FC<StatsProps> = ({
  totalAlumni,
  totalBatches,
  totalEvents,
  yearsConnected,
  loading
}) => {
  const { t, language } = useLanguage();

  const statsList = [
    {
      label: language === 'ta' ? 'பழைய மாணவர்கள்' : 'Alumni',
      value: `${totalAlumni.toLocaleString()}+`,
      subtitle: t('stat_alumni'),
      icon: Users
    },
    {
      label: language === 'ta' ? 'வகுப்புகள்' : 'Batches',
      value: `${totalBatches}+`,
      subtitle: t('stat_batches'),
      icon: GraduationCap
    },
    {
      label: language === 'ta' ? 'நிகழ்வுகள்' : 'Get-Togethers',
      value: `${totalEvents}+`,
      subtitle: t('stat_events'),
      icon: Calendar
    },
    {
      label: language === 'ta' ? 'இணைந்த ஆண்டுகள்' : 'Years Connected',
      value: `${yearsConnected}+`,
      subtitle: language === 'ta' ? 'சிறந்த பாரம்பரியம்' : 'Legacy of Excellence',
      icon: Award
    }
  ];

  return (
    <section id="community-stats" className="py-12 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('community_stats_title')}
          </h2>
        </div>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statsList.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-3.5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#F4C542]/20 flex items-center justify-center text-[#854D0E] group-hover:bg-[#F4C542] group-hover:text-[#111111] transition-colors shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">LIVE</span>
                </div>
                <div className="text-2xl sm:text-4xl font-bold text-[#111111] tracking-tight mb-0.5 sm:mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-base font-semibold text-gray-900 mb-0.5 truncate">{stat.label}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">{stat.subtitle}</div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};
