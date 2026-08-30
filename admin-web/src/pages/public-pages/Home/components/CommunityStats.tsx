import React from 'react';
import { Users, GraduationCap, Calendar, Award } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface StatsProps {
  totalAlumni: number;
  totalBatches: number;
  totalEvents: number;
  yearsConnected: number;
}

export const CommunityStats: React.FC<StatsProps> = ({
  totalAlumni,
  totalBatches,
  totalEvents,
  yearsConnected
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
    <section id="community-stats" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('community_stats_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F4C542]/20 flex items-center justify-center text-[#854D0E] group-hover:bg-[#F4C542] group-hover:text-[#111111] transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">LIVE</span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-base font-semibold text-gray-900 mb-0.5">{stat.label}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
