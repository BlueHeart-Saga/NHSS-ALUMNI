import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Users, UserCheck, MessageSquare, ChevronRight, User, X, Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { api } from '../../services/api';
import { AlumniProfile, Announcement } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniBatchesPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useOutletContext<AlumniContextType>();
  const [batchSubTab, setBatchSubTab] = useState<'info' | 'members' | 'classmates' | 'updates'>('info');
  const [batchMembers, setBatchMembers] = useState<AlumniProfile[]>([]);
  const [batchNotices, setBatchNotices] = useState<Announcement[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.passing_year) return;
    setLoading(true);
    
    Promise.all([
      api.searchAlumni(undefined, user.passing_year, 'APPROVED').catch(() => []),
      api.getAnnouncements(user.batch_id).catch(() => [])
    ]).then(([membersData, noticesData]) => {
      setBatchMembers(membersData);
      setBatchNotices(noticesData);
    }).finally(() => setLoading(false));
  }, [user?.passing_year, user?.batch_id]);

  const committeeMembers = batchMembers.filter(a => a.committee_role || a.roles?.includes('BATCH_COORDINATOR'));
  const uniqueCities = Array.from(new Set(batchMembers.map(a => a.current_city).filter(Boolean)));
  const uniqueSections = Array.from(new Set(batchMembers.map(a => a.section).filter(Boolean)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
            {language === 'ta' ? `வகுப்பு ${user?.passing_year || ''}` : `Batch of ${user?.passing_year || 'Alumni'}`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">
            {language === 'ta' ? `${user?.passing_year || ''} வகுப்பு தோழர்கள் தளம்` : `Class of ${user?.passing_year || ''} Hub`}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200 mt-2 max-w-xl">
            {language === 'ta'
              ? 'உங்கள் வகுப்புத் தோழர்களுடன் தொடர்பில் இருங்கள், வகுப்புப் பொறுப்பாளர்களைத் தெரிந்துகொள்ளுங்கள்.'
              : 'Stay connected with your classmates, view batch committee leaders, and check real-time batch messages.'}
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
        {[
          { id: 'info', label: language === 'ta' ? 'வகுப்பு விவரங்கள்' : 'Batch Information', icon: BookOpen },
          { id: 'members', label: language === 'ta' ? `உறுப்பினர்கள் (${batchMembers.length})` : `Batch Members (${batchMembers.length})`, icon: Users },
          { id: 'classmates', label: language === 'ta' ? 'வகுப்புத் தோழர்கள்' : 'Classmates', icon: UserCheck },
          { id: 'updates', label: language === 'ta' ? `அறிவிப்புப் பலகை (${batchNotices.length})` : `Batch Notice Board (${batchNotices.length})`, icon: MessageSquare }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setBatchSubTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              batchSubTab === tab.id
                ? 'bg-[#111111] text-white shadow-sm'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* BATCH INFO */}
      {batchSubTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm md:col-span-2 space-y-4">
            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'வகுப்பு கண்ணோட்டம் & குழுத் தலைவர்கள்' : 'Batch Overview & Committee'}
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              The batch of {user?.passing_year} consists of {batchMembers.length} verified alumni across {uniqueSections.length || 1} section(s). The batch committee coordinates class reunions, student scholarship drives, and regional chapter meetups.
            </p>
            
            <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
              <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider text-gray-500">Batch Leadership</h4>
              {committeeMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {committeeMembers.map((cm, idx) => (
                    <div key={cm.id || idx} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB] flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 overflow-hidden">
                        {cm.profile_photo_url ? (
                          <img src={cm.profile_photo_url} alt={cm.full_name} className="w-full h-full object-cover" />
                        ) : (
                          cm.full_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#111111]">{cm.full_name}</p>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          {cm.committee_role_title || cm.committee_role || 'Batch Representative'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E7EB] text-xs text-gray-500 text-center">
                  Batch committee members and coordinators for Class of {user?.passing_year} are being appointed.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#111111]">Batch Quick Facts</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Passing Year</span>
                <span className="font-bold">{user?.passing_year || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Batch Registered Members</span>
                <span className="font-bold">{batchMembers.length} Alumni</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Active Cities</span>
                <span className="font-bold">{uniqueCities.length} Cities</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                <span className="text-gray-500">Sections</span>
                <span className="font-bold">{uniqueSections.join(', ') || 'General Section'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATCH MEMBERS / CLASSMATES */}
      {(batchSubTab === 'members' || batchSubTab === 'classmates') && (
        <div className="space-y-4">
          {batchMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {batchMembers.map(a => (
                <div key={a.id || a.mobile} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                    {a.profile_photo_url ? (
                      <img src={a.profile_photo_url} alt={a.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-[#854D0E]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#111111] truncate">{a.full_name}</h4>
                    <span className="text-[10px] font-semibold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Class of {a.passing_year} {a.section ? `(${a.section})` : ''}
                    </span>
                    <p className="text-[11px] text-[#6B7280] mt-2 truncate">
                      {a.profession || 'Alumnus'} {a.current_city ? `• ${a.current_city}` : ''}
                    </p>
                    <button
                      onClick={() => setSelectedAlumni(a)}
                      className="mt-3 text-xs font-bold text-amber-800 hover:underline flex items-center space-x-1"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-2">
              <Users className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-600 font-semibold">No registered members found for Class of {user?.passing_year} yet.</p>
            </div>
          )}
        </div>
      )}

      {/* BATCH UPDATES */}
      {batchSubTab === 'updates' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#111111]">Batch Notice Board</h3>
          {batchNotices.length > 0 ? (
            <div className="space-y-3">
              {batchNotices.map(notice => (
                <div key={notice.id} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-bold text-[#111111]">{notice.title}</span>
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#374151] leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#FAFAFA] text-center border border-dashed border-[#E5E7EB] space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs text-[#6B7280]">No active announcements posted for Class of {user?.passing_year} yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <button onClick={() => setSelectedAlumni(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111]">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F4C542] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                {selectedAlumni.profile_photo_url ? (
                  <img src={selectedAlumni.profile_photo_url} alt={selectedAlumni.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#854D0E]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111111]">{selectedAlumni.full_name}</h3>
                <p className="text-amber-800 font-semibold">Class of {selectedAlumni.passing_year} {selectedAlumni.section ? `(${selectedAlumni.section})` : ''}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-gray-700">
              {selectedAlumni.profession && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.profession} {selectedAlumni.company ? `at ${selectedAlumni.company}` : ''}</span>
                </div>
              )}
              {selectedAlumni.current_city && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.current_city}</span>
                </div>
              )}
              {selectedAlumni.email_visible && selectedAlumni.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedAlumni.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
