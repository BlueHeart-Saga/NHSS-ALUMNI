import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Announcement } from '../../types';

export const AlumniAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    api.getAnnouncements()
      .then(setAnnouncements)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-[#111111]">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-[#111111]">Announcements & Important Notices</h2>
        <p className="text-xs text-[#6B7280]">Official announcements from school management and the alumni association</p>
        
        <div className="space-y-3 pt-2">
          {announcements.length > 0 ? (
            announcements.map(ann => (
              <div key={ann.id} className="p-5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {ann.target || 'SCHOOL'} ANNOUNCEMENT
                  </span>
                  <span className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-sm text-[#111111]">{ann.title}</h3>
                <p className="text-xs text-[#374151] leading-relaxed">{ann.content}</p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280]">No official announcements posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
