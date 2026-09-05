import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Announcement } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniAnnouncementsPage: React.FC = () => {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api.getAnnouncements()
      .then(setAnnouncements)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111] p-1 sm:p-0">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[#111111]">
          {language === 'ta' ? 'அறிவிப்புகள் & முக்கிய குறிப்புகள்' : 'Announcements & Important Notices'}
        </h2>
        <p className="text-xs text-[#6B7280]">
          {language === 'ta'
            ? 'பள்ளி நிர்வாகம் மற்றும் முன்னாள் மாணவர்கள் சங்கத்தின் அதிகாரப்பூர்வ அறிவிப்புகள்'
            : 'Official announcements from school management and the alumni association'}
        </p>

        <div className="space-y-3 pt-2">
          {announcements.length > 0 ? (
            announcements.map(ann => (
              <div key={ann.id} className="p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {language === 'ta' ? 'பள்ளி அறிவிப்பு' : `${ann.target || 'SCHOOL'} ANNOUNCEMENT`}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-sm text-[#111111]">{ann.title}</h3>
                <p className="text-xs text-[#374151] leading-relaxed">{ann.content}</p>
              </div>
            ))
          ) : (
            <div className="p-8 sm:p-12 text-center bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280]">
                {language === 'ta' ? 'அதிகாரப்பூர்வ அறிவிப்புகள் எதுவும் இன்னும் வெளியிடப்படவில்லை.' : 'No official announcements posted yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
