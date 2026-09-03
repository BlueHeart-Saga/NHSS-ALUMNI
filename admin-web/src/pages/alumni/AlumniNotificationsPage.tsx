import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Bell, Calendar, Sparkles, FileText, Megaphone, CheckCircle2, Clock, 
  Filter, RotateCcw, Loader2, Info, ChevronRight 
} from 'lucide-react';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export interface LiveNotificationItem {
  id: string;
  category: 'ANNOUNCEMENT' | 'SCHOOL_EVENT' | 'REUNION' | 'DOCUMENT';
  title: string;
  message: string;
  timestamp: string;
  statusTag?: string;
  isRead: boolean;
  linkUrl?: string;
}

export const AlumniNotificationsPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useOutletContext<AlumniContextType>();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<LiveNotificationItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const fetchLiveNotifications = async () => {
    setLoading(true);
    try {
      const items: LiveNotificationItem[] = [];

      // 1. Fetch Official Announcements (Batch + Global)
      try {
        const batchAnnouncements = await api.getAnnouncements(user?.batch_id);
        (batchAnnouncements || []).forEach((a: any) => {
          items.push({
            id: `ann-${a.id || Math.random()}`,
            category: 'ANNOUNCEMENT',
            title: a.title,
            message: a.content || a.message || 'New announcement published for alumni.',
            timestamp: a.created_at || 'Recent',
            statusTag: a.priority || 'NORMAL',
            isRead: false
          });
        });
      } catch (err) {
        console.warn('Announcements fetch error:', err);
      }

      // 2. Fetch Official School Events & Celebrations
      try {
        const schoolEvents = await api.getSchoolEvents();
        (schoolEvents || []).forEach((e: any) => {
          items.push({
            id: `sevent-${e.id || Math.random()}`,
            category: 'SCHOOL_EVENT',
            title: `School Event: ${e.title}`,
            message: `${e.category.replace(/_/g, ' ')} scheduled for ${e.event_date} at ${e.venue}. ${e.description ? e.description.slice(0, 100) + '...' : ''}`,
            timestamp: e.event_date || 'Upcoming',
            statusTag: e.status || 'UPCOMING',
            isRead: false,
            linkUrl: '/alumni/school-events'
          });
        });
      } catch (err) {
        console.warn('School events notification fetch error:', err);
      }

      // 3. Fetch Alumni Reunions & Events
      try {
        const alumniEvents = await api.getEvents();
        (alumniEvents || []).forEach((e: any) => {
          items.push({
            id: `aevent-${e.id || Math.random()}`,
            category: 'REUNION',
            title: `Alumni Event: ${e.title}`,
            message: `Batch Get-Together on ${e.event_date} at ${e.venue}. RSVP status: ${e.user_rsvp || 'PENDING'}.`,
            timestamp: e.event_date || 'Upcoming',
            statusTag: e.status || 'PUBLISHED',
            isRead: false,
            linkUrl: '/alumni/events'
          });
        });
      } catch (err) {
        console.warn('Alumni events fetch error:', err);
      }

      // 4. Fetch Document Request Statuses
      try {
        const docReqs = await api.getDocumentRequests();
        (docReqs || []).forEach((d: any) => {
          items.push({
            id: `docreq-${d.id || Math.random()}`,
            category: 'DOCUMENT',
            title: `Document Requisition: ${d.doc_type}`,
            message: `Status updated to [${d.status.replace(/_/g, ' ')}]. ${d.admin_remarks ? 'Admin remarks: ' + d.admin_remarks : 'Check status details.'}`,
            timestamp: d.created_at || 'Recent',
            statusTag: d.status,
            isRead: false,
            linkUrl: '/alumni/documents'
          });
        });
      } catch (err) {
        console.warn('Document requests fetch error:', err);
      }

      setNotifications(items);
    } catch (err) {
      console.error('Failed to compile live notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
  }, [user]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-amber-700" />;
      case 'SCHOOL_EVENT':
        return <Sparkles className="w-4 h-4 text-amber-700" />;
      case 'REUNION':
        return <Calendar className="w-4 h-4 text-amber-700" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-amber-700" />;
      default:
        return <Bell className="w-4 h-4 text-amber-700" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-[#111111]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">
            {language === 'ta' ? 'நேரலை அறிவிப்புகள்' : 'Live Notifications & Activity Stream'}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {language === 'ta'
              ? 'பள்ளி அறிவிப்புகள், நிகழ்வு அழைப்புகள் மற்றும் ஆவண நிலவரங்கள்'
              : 'Real-time alerts for school announcements, event invitations, and document requisition updates'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLiveNotifications}
            className="p-2 bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111111] rounded-xl border border-[#E5E7EB] transition-all"
            title={language === 'ta' ? 'புதுப்பிக்க' : 'Refresh Live Notifications'}
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-[#111111] text-white hover:bg-black text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            {language === 'ta' ? 'அனைத்தையும் படித்ததாகக் குறிக்க' : 'Mark All as Read'}
          </button>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
        {[
          { id: 'ALL', label: language === 'ta' ? `அனைத்து அறிவிப்புகள் (${notifications.length})` : `All Alerts (${notifications.length})` },
          { id: 'ANNOUNCEMENT', label: language === 'ta' ? `பள்ளி அறிவிப்புகள் (${notifications.filter(n => n.category === 'ANNOUNCEMENT').length})` : `Announcements (${notifications.filter(n => n.category === 'ANNOUNCEMENT').length})` },
          { id: 'SCHOOL_EVENT', label: language === 'ta' ? `பள்ளி விழாக்கள் (${notifications.filter(n => n.category === 'SCHOOL_EVENT').length})` : `School Events (${notifications.filter(n => n.category === 'SCHOOL_EVENT').length})` },
          { id: 'REUNION', label: language === 'ta' ? `மறுசந்திப்புகள் (${notifications.filter(n => n.category === 'REUNION').length})` : `Reunions (${notifications.filter(n => n.category === 'REUNION').length})` },
          { id: 'DOCUMENT', label: language === 'ta' ? `ஆவணங்கள் (${notifications.filter(n => n.category === 'DOCUMENT').length})` : `Document Requests (${notifications.filter(n => n.category === 'DOCUMENT').length})` }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              filterCategory === cat.id
                ? 'bg-[#111111] text-white shadow-sm'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification Stream Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-3">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#854D0E] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Synthesizing real-time alumni notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 text-xs ${
                n.isRead ? 'bg-white border-[#E5E7EB]' : 'bg-[#FFF7D6]/40 border-[#F4C542]/60 hover:border-[#F4C542]'
              }`}
            >
              <div className="p-2 bg-[#FFF7D6] border border-[#F4C542]/40 rounded-xl shrink-0">
                {getCategoryIcon(n.category)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-[#111111] truncate">{n.title}</h4>
                  <div className="flex items-center space-x-2 shrink-0">
                    {n.statusTag && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {n.statusTag}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-medium">{n.timestamp}</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{n.message}</p>
                {n.linkUrl && (
                  <a
                    href={n.linkUrl}
                    className="inline-flex items-center space-x-1 text-xs text-amber-800 font-bold hover:underline pt-1"
                  >
                    <span>View Section</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 border border-dashed border-gray-200 rounded-2xl text-center space-y-3">
            <Bell className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="font-bold text-xs text-[#111111]">No Notifications Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are no active notifications matching your category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
