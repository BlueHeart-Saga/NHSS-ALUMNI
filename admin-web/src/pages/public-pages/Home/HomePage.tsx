import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

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

      {/* 2. HERO SECTION */}
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
        onViewAllClick={() => setIsRegisterModalOpen(true)}
      />

      {/* 8. FROM OUR SCHOOL (News & Announcements) */}
      <SchoolNews
        announcements={announcements}
        onSelectNews={(news) => setSelectedNews(news)}
      />

      {/* 9. JOIN CTA */}
      {/* <JoinCTA
        schoolName={stats.school_name}
        onJoinClick={() => setIsRegisterModalOpen(true)}
      /> */}

      {/* Modal 1: Alumni Web Login / Register */}
      <Modal
        isOpen={isLoginModalOpen || isRegisterModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(false);
        }}
        title={isRegisterModalOpen ? "Join Alumni Network" : "Alumni Student Portal Login"}
      >
        <div className="space-y-4">
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {authError}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E]">
                Enter your mobile number to sign in or register your alumni profile.
              </div>

              <Input
                label="Registered Mobile Number"
                placeholder="+919876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />

              <Button type="submit" className="w-full py-3 bg-[#111111] text-white hover:bg-black font-bold" isLoading={submittingAuth}>
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="p-3 bg-[#FFF7D6] border border-[#F4C542]/60 rounded-xl text-xs text-[#854D0E]">
                Verification OTP sent to <strong>{mobile}</strong>.
              </div>

              <Input
                label="6-Digit OTP Code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />

              <Button type="submit" className="w-full py-3 bg-[#111111] text-white hover:bg-black font-bold" isLoading={submittingAuth}>
                Verify & Enter Web Portal
              </Button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-xs font-semibold text-[#6B7280] hover:text-[#111111] text-center"
              >
                Change Mobile Number
              </button>
            </form>
          )}
        </div>
      </Modal>

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
                setIsRegisterModalOpen(true);
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
    </div>
  );
};
