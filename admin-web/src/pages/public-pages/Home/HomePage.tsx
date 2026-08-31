import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { Hero } from './components/Hero';
import { CommunityStats } from './components/CommunityStats';
import { UpcomingEvents } from './components/UpcomingEvents';
import { FindYourBatch } from './components/FindYourBatch';
import { AlumniHighlights } from './components/AlumniHighlights';
import { MemoriesPreview } from './components/MemoriesPreview';
import { SchoolNews } from './components/SchoolNews';
// import { JoinCTA } from './components/JoinCTA';

import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Public Backend Data State
  const [stats, setStats] = useState<any>({
    school_name: 'Our School',
    school_code: 'SCHOOL',
    logo_url: '',
    cover_url: '',
    total_alumni: 0,
    total_batches: 0,
    total_events: 0,
    years_connected: 0
  });
  const [events, setEvents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Detail Modals
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);

  // Alumni Web Login OTP Form
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      const [sData, eData, bData, hData, mData, aData] = await Promise.all([
        api.getPublicStats().catch(() => null),
        api.getPublicEvents().catch(() => []),
        api.getPublicBatches().catch(() => []),
        api.getPublicHighlights().catch(() => []),
        api.getPublicMemories().catch(() => []),
        api.getPublicAnnouncements().catch(() => [])
      ]);

      if (sData) setStats(sData);
      if (eData.length) setEvents(eData);
      if (bData.length) setBatches(bData);
      if (hData.length) setHighlights(hData);
      if (mData.length) setMemories(mData);
      if (aData.length) setAnnouncements(aData);
    } catch (err) {
      console.error('Failed to load public portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmittingAuth(true);

    try {
      await api.sendOTP(mobile);
      setOtpSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send verification code.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmittingAuth(true);

    try {
      const res = await api.verifyOTP(mobile, otp);
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(false);
      navigate('/alumni');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const scrollToExplore = () => {
    const el = document.getElementById('community-stats');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#111111] flex flex-col selection:bg-[#F4C542] selection:text-[#111111]">
      {/* 1. HERO SECTION */}
      <Hero
        schoolName={stats.school_name}
        schoolCode={stats.school_code}
        coverUrl={stats.cover_url}
        onJoinClick={() => setIsRegisterModalOpen(true)}
        onExploreClick={scrollToExplore}
      />

      {/* 3. COMMUNITY STATISTICS (MongoDB Powered) */}
      <CommunityStats
        totalAlumni={stats.total_alumni}
        totalBatches={stats.total_batches}
        totalEvents={stats.total_events}
        yearsConnected={stats.years_connected}
      />

      {/* 4. UPCOMING GET-TOGETHERS */}
      <UpcomingEvents
        events={events}
        onSelectEvent={(event) => setSelectedEvent(event)}
      />

      {/* 5. FIND YOUR BATCH */}
      <FindYourBatch
        batches={batches}
        onSelectBatch={(year) => setIsRegisterModalOpen(true)}
      />

      {/* 6. ALUMNI HIGHLIGHTS */}
      <AlumniHighlights
        highlights={highlights}
      />

      {/* 7. MEMORIES GALLERY */}
      <MemoriesPreview
        memories={memories}
        onViewAllClick={() => navigate('/login')}
        onSelectMemory={(memory) => setSelectedMemory(memory)}
      />

      {/* 8. FROM OUR SCHOOL (News & Announcements) */}
      <SchoolNews
        announcements={announcements}
        onSelectNews={(news) => setSelectedNews(news)}
      />

      {/* Modal 2: Event Details Preview */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event Details"}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <img src={selectedEvent.cover_image_url} alt="" className="w-full h-48 rounded-2xl object-cover border border-[#E5E7EB]" />
            <span className="text-xs font-bold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-3 py-1 rounded-full">
              {selectedEvent.batch_name}
            </span>
            <p className="text-xs text-[#6B7280] leading-relaxed">{selectedEvent.description}</p>
            <div className="text-xs text-[#111111] space-y-1 bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB]">
              <div>📅 <strong>Date:</strong> {selectedEvent.event_date} ({selectedEvent.start_time})</div>
              <div>📍 <strong>Venue:</strong> {selectedEvent.venue}</div>
              <div>👥 <strong>Attending:</strong> {selectedEvent.attending_count} Alumni Confirmed</div>
            </div>
            <Button
              className="w-full bg-[#111111] text-white hover:bg-black font-bold"
              onClick={() => {
                setSelectedEvent(null);
                navigate('/login');
              }}
            >
              Sign In to RSVP & Get Ticket
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal 3: News / Announcement Preview */}
      <Modal
        isOpen={Boolean(selectedNews)}
        onClose={() => setSelectedNews(null)}
        title={selectedNews?.title || "School Notice"}
      >
        {selectedNews && (
          <div className="space-y-4">
            <div className="text-xs text-[#6B7280]">
              Published on {new Date(selectedNews.created_at).toLocaleDateString()}
            </div>
            <p className="text-xs text-[#111111] leading-relaxed whitespace-pre-wrap">
              {selectedNews.content}
            </p>
            <Button variant="secondary" className="w-full" onClick={() => setSelectedNews(null)}>
              Close Notice
            </Button>
          </div>
        )}
      </Modal>

      {/* Interactive Lightbox Popup Modal for Home Memories */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border-2 border-[#F4C542]/60">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="max-h-[60vh] bg-black overflow-hidden flex items-center justify-center">
              <img
                src={selectedMemory.image_url}
                alt={selectedMemory.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            {/* Modal Info Bar */}
            <div className="p-6 bg-white space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">{selectedMemory.title}</h3>
                {selectedMemory.uploader_name && (
                  <span className="text-sm text-gray-500 font-normal mt-1 block">
                    Uploaded by {selectedMemory.uploader_name}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  {language === 'ta' ? 'அனைத்து நினைவுகளையும் பார்க்க உள்நுழைக' : 'Log in to view complete batch photo archive'}
                </p>
                <button
                  onClick={() => {
                    setSelectedMemory(null);
                    navigate('/login');
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer"
                >
                  <span>{language === 'ta' ? 'உள்நுழைக' : 'Log In'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
