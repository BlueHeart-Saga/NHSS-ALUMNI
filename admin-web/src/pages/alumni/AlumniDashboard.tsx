import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Users, Calendar, MessageSquare, Bell, CheckCircle2, ChevronRight, MapPin, Clock 
} from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, Announcement } from '../../types';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { useLanguage } from '../../context/LanguageContext';

export const AlumniDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, school } = useOutletContext<AlumniContextType>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [alumniCount, setAlumniCount] = useState<number>(0);
  const [stats, setStats] = useState<any>({
    total_alumni: 0,
    total_batches: 0,
    total_events: 0
  });

  useEffect(() => {
    Promise.all([
      api.getEvents().catch(() => []),
      api.getAnnouncements().catch(() => []),
      api.getAlumniDirectory().catch(() => []),
      api.getPublicStats().catch(() => ({}))
    ]).then(([evData, annData, dirData, statsData]) => {
      setEvents(evData);
      setAnnouncements(annData);
      setAlumniCount(dirData.length);
      if (statsData) {
        setStats(statsData);
      }
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111]">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#2D2D2D] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ta'
                ? `மீண்டும் நல்வரவு, ${user?.full_name || 'உறுப்பினரே'}!`
                : `Welcome back, ${user?.full_name || 'Alumnus'}!`}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl">
              {language === 'ta'
                ? `${user?.passing_year || ''} ஆம் ஆண்டு வகுப்புத் தோழர்களுடன் தொடர்பில் இருங்கள், வரவிருக்கும் நிகழ்வுகளைப் பாருங்கள் மற்றும் சான்றிதழ்களைப் பெறுங்கள்.`
                : `Stay connected with your batchmates from Class of ${user?.passing_year || 'Alumni'}, explore upcoming events, request certificates, and guide younger alumni.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => navigate('/alumni/profile')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#111111] hover:bg-gray-100 text-xs font-bold transition-all shadow-sm"
            >
              {language === 'ta' ? 'சுயவிவரத்தைத் திருத்து' : 'Edit Profile'}
            </button>
            <button
              onClick={() => navigate('/alumni/directory')}
              className="px-4 py-2.5 rounded-xl bg-[#F4C542] text-[#111111] hover:bg-[#E5B532] text-xs font-bold transition-all shadow-sm"
            >
              {language === 'ta' ? 'தோழர்களைத் தேடுக' : 'Find Batchmates'}
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-[#F4C542]/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold">{language === 'ta' ? 'மொத்த மாணவர்கள்' : 'Total Alumni'}</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#111111]">{stats.total_alumni || alumniCount || 0}</p>
          <span className="text-[11px] text-[#6B7280] mt-1">{language === 'ta' ? 'பதிவு செய்யப்பட்டவர்கள்' : 'Registered members'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold">{language === 'ta' ? 'வகுப்பு ஆண்டுகள்' : 'Graduating Batches'}</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#111111]">{stats.total_batches || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1">{language === 'ta' ? 'இணைக்கப்பட்ட வகுப்புகள்' : 'Batches connected'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold">{language === 'ta' ? 'வரவிருக்கும் நிகழ்வுகள்' : 'Upcoming Events'}</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#111111]">{events.length || stats.total_events || 0}</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1">{language === 'ta' ? 'செயலில் உள்ளவை' : 'Active events'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold">{language === 'ta' ? 'அறிவிப்புகள்' : 'Announcements'}</span>
            <Bell className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#111111]">{announcements.length}</p>
          <span className="text-[11px] text-[#6B7280] mt-1">{language === 'ta' ? 'அதிகாரப்பூர்வ தகவல்கள்' : 'Official notices'}</span>
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#111111]">
                {language === 'ta' ? 'வரவிருக்கும் நிகழ்வுகள்' : 'Upcoming Alumni Events'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {language === 'ta' ? 'வரவிருக்கும் சந்திப்புகள் மற்றும் விழாக்களில் பங்கேற்கவும்' : 'Register for upcoming gatherings and reunions'}
              </p>
            </div>
            <button
              onClick={() => navigate('/alumni/events')}
              className="text-xs font-bold text-[#111111] hover:underline flex items-center space-x-1"
            >
              <span>{language === 'ta' ? 'அனைத்தையும் காண்க' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {events.length > 0 ? (
              events.slice(0, 2).map(ev => {
                const title = language === 'ta' ? (ev.title_ta || ev.title) : ev.title;
                return (
                  <div key={ev.id} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-[#111111] text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold uppercase text-amber-400">
                          {new Date(ev.event_date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-sm font-extrabold">
                          {new Date(ev.event_date).getDate() || '15'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#111111]">{title}</h4>
                        <p className="text-[11px] text-[#6B7280] flex items-center space-x-2 mt-1">
                          <span className="flex items-center space-x-1"><MapPin className="w-3 h-3 text-gray-400" /><span>{ev.venue}</span></span>
                          <span>•</span>
                          <span className="flex items-center space-x-1"><Clock className="w-3 h-3 text-gray-400" /><span>{ev.start_time}</span></span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/alumni/events')}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-gray-800 text-xs font-bold shrink-0 transition-all"
                    >
                      {language === 'ta' ? 'பதிவு செய்க' : 'RSVP / Register'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-6 rounded-xl bg-[#FAFAFA] text-center border border-dashed border-[#E5E7EB]">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-[#6B7280]">
                  {language === 'ta' ? 'தற்போது புதிய நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை.' : 'No upcoming events scheduled right now.'}
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Recent Announcements Feed */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#111111]">
              {language === 'ta' ? 'சமீபத்திய அறிவிப்புகள்' : 'Recent Announcements & Notices'}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {language === 'ta' ? 'பள்ளி நிர்வாகத்தின் அதிகாரப்பூர்வ அறிவிப்புகள்' : 'Official notices from school admin and alumni association'}
            </p>
          </div>
          <button
            onClick={() => navigate('/alumni/announcements')}
            className="text-xs font-bold text-[#111111] hover:underline flex items-center space-x-1"
          >
            <span>{language === 'ta' ? 'அனைத்து தகவல்களையும் காண்க' : 'View All Notices'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.length > 0 ? (
            announcements.slice(0, 2).map(ann => (
              <div key={ann.id} className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {language === 'ta' ? 'பள்ளி அறிவிப்பு' : `${ann.target || 'SCHOOL'} NOTICE`}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#111111]">{ann.title}</h4>
                <p className="text-xs text-[#4B5563] line-clamp-2">{ann.content}</p>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-6 rounded-xl bg-[#FAFAFA] text-center border border-dashed border-[#E5E7EB]">
              <Bell className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
              <p className="text-xs text-[#6B7280]">
                {language === 'ta' ? 'அறிவிப்புகள் எதுவும் இன்னும் வெளியிடப்படவில்லை.' : 'No active announcements posted yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
