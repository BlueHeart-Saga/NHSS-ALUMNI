import React, { useEffect, useState } from 'react';
import { User, Calendar, ChevronDown } from 'lucide-react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { SchoolStaff } from '../../../types';

export const OldStaffsSection: React.FC = () => {
  const { language } = useLanguage();
  const [oldStaff, setOldStaff] = useState<SchoolStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    fetchOldStaff();
  }, []);

  const fetchOldStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicOldStaff();
      setOldStaff(data || []);
    } catch (err) {
      console.error('Failed to load old staff:', err);
      setOldStaff([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const isTa = language === 'ta';
  const hasData = oldStaff && oldStaff.length > 0;
  const visibleStaff = hasData ? oldStaff.slice(0, visibleCount) : [];

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, oldStaff.length));
  };

  return (
    <section 
      id="old-staff-records"
      lang={isTa ? 'ta' : 'en'} 
      className="py-4 sm:py-6 bg-white rounded-3xl p-4 sm:p-6 relative overflow-hidden font-sans leading-relaxed text-[#111111]"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-6 sm:space-y-8 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
            {isTa
              ? 'நமது முன்னாள் தலைமை ஆசிரியர்கள் மற்றும் ஆசிரியர்கள்'
              : 'Our Honoured Former Headmasters & Teachers'}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
            {isTa
              ? 'பள்ளியின் வளர்ச்சிக்கு உறுதுணையாக இருந்து சேவை ஆற்றிய முன்னாள் ஆசிரியர்கள் மற்றும் தலைமை ஆசிரியர்கள்.'
              : 'Honouring the legendary headmasters, teachers, and staff who built the foundation of academic excellence for generations.'}
          </p>
        </div>

        {/* FORMER STAFF CARDS GRID */}
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-2">
            {visibleStaff.map((staff) => {
              const nameToDisplay = isTa ? (staff.full_name_ta || staff.full_name) : staff.full_name;
              const positionToDisplay = isTa ? (staff.school_position_ta || staff.school_position) : (staff.school_position || 'Former Staff');
              const deptToDisplay = isTa ? (staff.department_ta || staff.department) : staff.department;
              const achievementsToDisplay = isTa 
                ? (staff.achievements_ta || staff.achievements || staff.notes_ta || staff.notes) 
                : (staff.achievements || staff.notes);

              return (
                <div
                  key={staff.id}
                  className="bg-gray-50/80 border border-gray-200/80 hover:border-[#F4C542] rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
                >
                  {/* Circular Avatar Photo */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex items-center justify-center shrink-0 relative">
                    {staff.profile_photo_url ? (
                      <img
                        src={staff.profile_photo_url}
                        alt={nameToDisplay}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center text-amber-700">
                        <User className="w-16 h-16 stroke-[1.8]" />
                      </div>
                    )}
                  </div>

                  {/* Title & Tenure */}
                  <div className="space-y-1 w-full">
                    <span className="text-[11px] font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider">
                      {positionToDisplay}
                    </span>

                    <h3 className="font-extrabold text-base sm:text-lg text-[#111111] leading-snug pt-1">
                      {nameToDisplay}
                    </h3>

                    {deptToDisplay && (
                      <div className="text-xs text-gray-500 font-medium">
                        {deptToDisplay}
                      </div>
                    )}

                    {(staff.service_start_year || staff.service_end_year) && (
                      <div className="text-xs font-semibold text-amber-900/90 flex items-center justify-center space-x-1 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                        <span>
                          {staff.service_start_year || '?'} - {staff.service_end_year || (isTa ? 'ஓய்வு' : 'Retired')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Achievements / Notes */}
                  {achievementsToDisplay && (
                    <p className="text-xs text-gray-600 font-normal leading-relaxed pt-2 border-t border-gray-200/80 w-full line-clamp-3">
                      {achievementsToDisplay}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ZERO DATA PLACEHOLDER UI CARD */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-2">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-gray-50/60 border border-gray-200 border-dashed rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-2xs opacity-85"
              >
                {/* Profile Icon Placeholder */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-amber-50/50 border-4 border-white shadow-xs flex items-center justify-center shrink-0">
                  <User className="w-16 h-16 text-amber-700/60 stroke-[1.5]" />
                </div>

                {/* Role / Position & Teacher Name Placeholder */}
                <div className="space-y-1 w-full">
                  <span className="text-[11px] font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/60 px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider">
                    {isTa ? 'முன்னாள் ஆசிரியர் பதவி' : 'Former Designation'}
                  </span>

                  <h3 className="font-extrabold text-base sm:text-lg text-gray-800 leading-snug pt-1">
                    {isTa ? 'ஆசிரியர் பெயர்' : 'Teacher Name'}
                  </h3>

                  <div className="text-xs text-gray-500 font-medium">
                    {isTa ? 'பள்ளித் துறை' : 'School Department'}
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-normal leading-relaxed pt-2 border-t border-gray-200/80 w-full">
                  {isTa ? 'முன்னாள் ஆசிரியர் விபரங்கள் விரைவில் சேர்க்கப்படும்.' : 'Former staff details will be updated soon by school management.'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasData && visibleCount < oldStaff.length && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 hover:border-[#F4C542] text-[#111111] font-bold text-sm px-6 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>{isTa ? 'மேலும் பார்க்க' : 'Load More Former Staff'}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
