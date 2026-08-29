import React from 'react';
import { Users, GraduationCap, Calendar, Award } from 'lucide-react';

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
  const statsList = [
    {
      label: 'Alumni',
      value: `${totalAlumni.toLocaleString()}+`,
      subtitle: 'Registered School Alumni',
      icon: Users
    },
    {
      label: 'Batches',
      value: `${totalBatches}+`,
      subtitle: 'Passing Year Cohorts',
      icon: GraduationCap
    },
    {
      label: 'Get-Togethers',
      value: `${totalEvents}+`,
      subtitle: 'Reunions & Gatherings',
      icon: Calendar
    },
    {
      label: 'Years Connected',
      value: `${yearsConnected}+`,
      subtitle: 'Legacy of Excellence',
      icon: Award
    }
  ];

  return (
    <section id="community-stats" className="py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          {/* <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
            OUR COMMUNITY
          </span> */}
          <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] tracking-tight pt-2">
            Real-Time Network Impact
          </h2>
          {/* <p className="text-lg text-gray-600 font-normal mt-2">
            Live data powered directly by our central MongoDB database
          </p> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 text-center shadow-md hover:border-[#F4C542] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden group"
              >
                {/* Bottom-to-Top Glass Fill Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/90 via-[#FFF7D6]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF7D6] border-2 border-[#F4C542] text-[#111111] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-xs">
                    <Icon className="w-8 h-8 text-[#111111]" />
                  </div>
                  <div className="text-5xl sm:text-6xl font-semibold text-[#111111] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xl font-semibold text-[#111111] mt-3">{stat.label}</div>
                  <div className="text-base font-normal text-gray-500 mt-1">{stat.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
