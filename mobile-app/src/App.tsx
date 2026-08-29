import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Calendar, Image as ImageIcon, User, QrCode, 
  ChevronRight, ArrowLeft, LogOut, CheckCircle2, AlertCircle, Plus, 
  MapPin, Clock, ShieldAlert, Sparkles, Send, Lock, Smartphone, RefreshCw
} from 'lucide-react';
import { mobileApi } from './services/api';

export const App: React.FC = () => {
  // Navigation & State
  const [token, setToken] = useState<string | null>(mobileApi.getToken());
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'BATCH' | 'EVENTS' | 'MEMORIES' | 'PROFILE'>('HOME');

  // Screen Stack
  const [screen, setScreen] = useState<'SPLASH' | 'WELCOME' | 'LOGIN' | 'OTP' | 'REGISTER' | 'PENDING' | 'MAIN'>('SPLASH');

  // Auth Flow Form State
  const [mobileNo, setMobileNo] = useState('+919876543210');
  const [otpPin, setOtpPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassingYear, setRegPassingYear] = useState<number>(2010);
  const [regAdmissionNo, setRegAdmissionNo] = useState('');
  const [regSection, setRegSection] = useState('A');
  const [regCity, setRegCity] = useState('');
  const [regProfession, setRegProfession] = useState('');

  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    mobileApi.getSchoolProfile().then(setSchool).catch(console.error);
  }, []);

  // Dynamic Data States
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [batchMembers, setBatchMembers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);

  // Sub-screens & Modals
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [adultsCount, setAdultsCount] = useState(1);
  const [kidsCount, setKidsCount] = useState(0);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Device Frame Viewport Toggle (Desktop preview vs Full screen)
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Initial Boot
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        loadUserProfile();
      } else {
        setScreen('WELCOME');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const loadUserProfile = async () => {
    try {
      const u = await mobileApi.getMe();
      setUserProfile(u);
      if (u.verification_status === 'NOT_REGISTERED') {
        setScreen('REGISTER');
      } else if (u.verification_status === 'PENDING') {
        setScreen('PENDING');
      } else {
        setScreen('MAIN');
        loadMainData(u);
      }
    } catch (err) {
      console.error(err);
      mobileApi.clearToken();
      setToken(null);
      setScreen('WELCOME');
    }
  };

  const loadMainData = async (userDoc?: any) => {
    const u = userDoc || userProfile;
    try {
      const [sData, evData, annData, memData] = await Promise.all([
        mobileApi.getSchoolProfile().catch(() => null),
        mobileApi.getEvents().catch(() => []),
        mobileApi.getAnnouncements().catch(() => []),
        mobileApi.getMemories().catch(() => [])
      ]);
      setSchool(sData);
      setEvents(evData);
      if (evData.length > 0) setSelectedEvent(evData[0]);
      setAnnouncements(annData);
      setMemories(memData);

      if (u?.passing_year) {
        const batches = await mobileApi.getBatches().catch(() => []);
        const b = batches.find((x: any) => x.passing_year === u.passing_year);
        if (b) {
          const members = await mobileApi.getBatchMembers(b.id).catch(() => []);
          setBatchMembers(members);
        }
      }
    } catch (err) {
      console.error('Failed to load main data:', err);
    }
  };

  // Auth Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await mobileApi.sendOTP(mobileNo);
      setOtpPin('');
      setScreen('OTP');
    } catch (err: any) {
      setAuthError(err.message || 'OTP delivery failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await mobileApi.verifyOTP(mobileNo, otpPin);
      setToken(res.access_token);
      await loadUserProfile();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP pin');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await mobileApi.register({
        full_name: regFullName,
        mobile: mobileNo,
        email: regEmail,
        passing_year: regPassingYear,
        admission_number: regAdmissionNo,
        section: regSection,
        current_city: regCity,
        profession: regProfession
      });
      await loadUserProfile();
    } catch (err: any) {
      alert('Registration failed: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // RSVP Handler
  const handleConfirmRSVP = async (rsvpStatus: string) => {
    if (!selectedEvent) return;
    setRsvpSubmitting(true);
    try {
      const res = await mobileApi.submitRSVP(selectedEvent.id, rsvpStatus, adultsCount, kidsCount);
      setQrToken(res.qr_token);
      setShowRsvpModal(false);
      setShowQrModal(true);
      loadMainData();
    } catch (err: any) {
      alert('RSVP submission failed: ' + err.message);
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const batches = await mobileApi.getBatches();
      const userBatch = batches.find((b: any) => b.passing_year === userProfile?.passing_year);
      const batchId = userBatch ? userBatch.id : batches[0]?.id;

      await mobileApi.uploadPhoto(batchId, uploadFile, uploadTitle);
      alert('Photo memory uploaded successfully!');
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      loadMainData();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ----------------------------------------------------
  // SCREEN RENDERING
  // ----------------------------------------------------

  // 1. SPLASH SCREEN
  if (screen === 'SPLASH') {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-20 h-20 bg-[#F4C542] rounded-3xl flex items-center justify-center text-[#111111] text-3xl font-extrabold shadow-2xl mb-6 animate-pulse">
          {school?.code || 'SCH'}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{school?.name?.toUpperCase() || 'ALUMNI APP'}</h1>
        <p className="text-sm text-gray-400 mt-2 font-medium">Alumni & Batch Reunion Platform</p>
        <div className="mt-12 w-6 h-6 border-2 border-[#F4C542] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // DEVICE FRAME WRAPPER FOR PREVIEWING MOBILE APP
  const renderAppContent = () => {
    // 2. WELCOME SCREEN
    if (screen === 'WELCOME') {
      return (
        <div className="flex-1 bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn">
          <div className="pt-8 text-center">
            <div className="w-20 h-20 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl flex items-center justify-center mx-auto text-[#111111] text-2xl font-bold shadow-sm mb-6">
              {school?.code || 'SCH'}
            </div>
            <h2 className="text-2xl font-bold">Welcome Back, Alumnus</h2>
            <p className="text-xs text-[#6B7280] mt-2 leading-relaxed max-w-xs mx-auto">
              Stay connected with school batchmates, RSVP for reunions, view photos, and scan event tickets.
            </p>
          </div>

          <div className="space-y-4 pb-6">
            <button
              onClick={() => setScreen('LOGIN')}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-4 rounded-2xl shadow-sm text-sm active-press transition-all flex items-center justify-center space-x-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Login with Mobile OTP</span>
            </button>
            <div className="text-center text-[11px] text-[#6B7280]">
              Private & Verified School Alumni Network
            </div>
          </div>
        </div>
      );
    }

    // 3. LOGIN SCREEN
    if (screen === 'LOGIN') {
      return (
        <div className="flex-1 bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn">
          <div>
            <button onClick={() => setScreen('WELCOME')} className="p-2 text-gray-500 hover:text-black mb-4">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">Enter Mobile Number</h2>
            <p className="text-xs text-[#6B7280] mt-1">We will send a 6-digit OTP code to verify your account.</p>

            {authError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {authError}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">Mobile Number</label>
                <input
                  type="text"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 text-base font-medium text-[#111111] focus:outline-none focus:border-[#F4C542]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-4 rounded-2xl text-sm shadow-sm active-press mt-4"
              >
                {authLoading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      );
    }

    // 4. OTP SCREEN
    if (screen === 'OTP') {
      return (
        <div className="flex-1 bg-white p-6 flex flex-col justify-between text-[#111111] animate-fadeIn">
          <div>
            <button onClick={() => setScreen('LOGIN')} className="p-2 text-gray-500 hover:text-black mb-4">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">Verify Security OTP</h2>
            <p className="text-xs text-[#6B7280] mt-1">Code sent to <strong>{mobileNo}</strong>.</p>

            {authError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">6-Digit Pin</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpPin}
                  onChange={(e) => setOtpPin(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest text-[#111111] focus:outline-none focus:border-[#F4C542]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-4 rounded-2xl text-sm shadow-sm active-press mt-4"
              >
                {authLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        </div>
      );
    }

    // 5. ALUMNI REGISTRATION SCREEN
    if (screen === 'REGISTER') {
      return (
        <div className="flex-1 bg-white p-6 overflow-y-auto no-scrollbar text-[#111111] animate-fadeIn">
          <h2 className="text-2xl font-bold">Alumni Registration</h2>
          <p className="text-xs text-[#6B7280] mt-1 mb-6">Complete your profile details for school admin verification.</p>

          <form onSubmit={handleRegister} className="space-y-4 pb-8">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Batch / Passing Year *</label>
                <input
                  type="number"
                  value={regPassingYear}
                  onChange={(e) => setRegPassingYear(Number(e.target.value))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Section</label>
                <input
                  type="text"
                  value={regSection}
                  onChange={(e) => setRegSection(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Admission Number / Alumni ID *</label>
              <input
                type="text"
                value={regAdmissionNo}
                onChange={(e) => setRegAdmissionNo(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Current City</label>
              <input
                type="text"
                value={regCity}
                onChange={(e) => setRegCity(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Profession</label>
              <input
                type="text"
                value={regProfession}
                onChange={(e) => setRegProfession(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-sm mt-4 active-press"
            >
              Submit Registration
            </button>
          </form>
        </div>
      );
    }

    // 6. VERIFICATION PENDING SCREEN
    if (screen === 'PENDING') {
      return (
        <div className="flex-1 bg-white p-6 flex flex-col justify-between text-[#111111] text-center animate-fadeIn">
          <div className="pt-12">
            <div className="w-20 h-20 bg-[#FFF7D6] border-2 border-[#F4C542] rounded-3xl flex items-center justify-center mx-auto text-[#854D0E] shadow-sm mb-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold">Verification Pending</h2>
            <p className="text-xs text-[#6B7280] mt-2 max-w-xs mx-auto leading-relaxed">
              Your alumni profile registration has been submitted and is currently being reviewed by <strong>{school?.name || 'School'}</strong> admin.
            </p>

            <div className="mt-8 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 text-xs text-left space-y-2">
              <div>Name: <strong>{userProfile?.full_name}</strong></div>
              <div>Batch: <strong>Class of {userProfile?.passing_year}</strong></div>
              <div>Status: <span className="font-bold text-[#854D0E]">PENDING REVIEW</span></div>
            </div>
          </div>

          <div className="space-y-3 pb-6">
            <button
              onClick={() => loadUserProfile()}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] text-[#111111] font-semibold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span>Refresh Verification Status</span>
            </button>
            <button
              onClick={() => {
                mobileApi.clearToken();
                setToken(null);
                setScreen('WELCOME');
              }}
              className="w-full text-xs font-semibold text-rose-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }

    // 7 - 19 MAIN APPROVED ALUMNI SCREEN FLOW
    return (
      <div className="flex-1 bg-[#FAFAFA] flex flex-col h-full overflow-hidden text-[#111111]">
        {/* App Top Header Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-5 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF7D6] border border-[#F4C542] font-bold text-xs flex items-center justify-center text-[#111111]">
              {school?.code || 'SCH'}
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#111111] leading-tight">{school?.name || 'School'}</h1>
              <span className="text-[10px] text-[#6B7280] font-medium">Batch {userProfile?.passing_year}</span>
            </div>
          </div>

          {events.length > 0 && (
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-[#FFF7D6] border border-[#F4C542] text-[#854D0E] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Event QR</span>
            </button>
          )}
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
          {/* TAB 1: HOME DASHBOARD */}
          {activeTab === 'HOME' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Greeting Card */}
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
                <span className="text-xs text-[#6B7280]">Good morning,</span>
                <h2 className="text-xl font-bold text-[#111111] mt-0.5">{userProfile?.full_name}</h2>
                <div className="mt-3 inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/60 px-3 py-1 rounded-full text-xs font-bold text-[#854D0E]">
                  <span>CLASS OF {userProfile?.passing_year}</span>
                </div>
              </div>

              {/* Featured Upcoming Reunion Hero Card */}
              {selectedEvent && (
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#854D0E] bg-[#FFF7D6] px-2.5 py-0.5 rounded-full border border-[#F4C542]/60">
                      UPCOMING GET-TOGETHER
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {selectedEvent.attending_count} Attending
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111111] leading-snug">{selectedEvent.title}</h3>
                  <p className="text-xs text-[#6B7280] line-clamp-2">{selectedEvent.description}</p>

                  <div className="space-y-1.5 text-xs text-[#111111] pt-2 border-t border-[#E5E7EB]">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedEvent.event_date} ({selectedEvent.start_time})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{selectedEvent.venue}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center space-x-2">
                    <button
                      onClick={() => setShowRsvpModal(true)}
                      className="flex-1 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3 rounded-2xl text-xs active-press transition-all"
                    >
                      Respond / RSVP Attendance
                    </button>
                  </div>
                </div>
              )}

              {/* Latest Announcement */}
              {announcements.length > 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#111111]">LATEST ANNOUNCEMENT</span>
                    <span className="text-[11px] text-[#6B7280]">Recent</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#111111]">{announcements[0].title}</h4>
                  <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{announcements[0].content}</p>
                </div>
              )}

              {/* Recent Memories Grid Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">RECENT MEMORIES</span>
                  <button onClick={() => setActiveTab('MEMORIES')} className="text-xs font-bold text-[#854D0E]">
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {memories.slice(0, 2).map((m) => (
                    <div key={m.id} className="h-32 rounded-2xl overflow-hidden bg-gray-200 border border-[#E5E7EB]">
                      <img src={m.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATCH DIRECTORY */}
          {activeTab === 'BATCH' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs">
                <h2 className="text-lg font-bold text-[#111111]">Class of {userProfile?.passing_year}</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{batchMembers.length} Verified Alumni Batchmates</p>

                <input
                  type="text"
                  placeholder="Search batchmate by name or city..."
                  value={searchMemberQuery}
                  onChange={(e) => setSearchMemberQuery(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl px-4 py-2 text-xs mt-3 focus:outline-none focus:border-[#F4C542]"
                />
              </div>

              <div className="space-y-3">
                {batchMembers
                  .filter((m) => m.full_name.toLowerCase().includes(searchMemberQuery.toLowerCase()))
                  .map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between shadow-xs active-press cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={member.profile_photo_url} alt="" className="w-10 h-10 rounded-full border border-[#E5E7EB] object-cover" />
                        <div>
                          <div className="font-bold text-sm text-[#111111]">{member.full_name}</div>
                          <div className="text-xs text-[#6B7280]">{member.profession || 'Alumnus'} • {member.current_city || 'India'}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: EVENTS FEED */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-lg font-bold text-[#111111]">Get-Together Events</h2>

              {events.map((ev) => (
                <div key={ev.id} className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold bg-[#FFF7D6] text-[#854D0E] px-2.5 py-0.5 rounded-full border border-[#F4C542]/60">
                      {ev.batch_name || 'School-wide'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">{ev.attending_count} Confirmed</span>
                  </div>

                  <h3 className="font-bold text-base text-[#111111]">{ev.title}</h3>
                  <p className="text-xs text-[#6B7280] line-clamp-2">{ev.description}</p>

                  <div className="space-y-1 text-xs text-[#111111]">
                    <div>📅 {ev.event_date} ({ev.start_time})</div>
                    <div>📍 {ev.venue}</div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEvent(ev);
                      setShowRsvpModal(true);
                    }}
                    className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3 rounded-2xl text-xs active-press mt-2"
                  >
                    Confirm RSVP & Guest Count
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: MEMORIES GALLERY */}
          {activeTab === 'MEMORIES' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111111]">Event Memories</h2>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-[#F4C542] text-[#111111] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-xs active-press"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {memories.map((m) => (
                  <div key={m.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
                    <img src={m.image_url} alt="" className="w-full h-36 object-cover" />
                    <div className="p-2.5 text-xs">
                      <div className="font-bold text-[#111111] truncate">{m.title || 'Reunion Photo'}</div>
                      <div className="text-[10px] text-[#6B7280]">{m.uploader_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE & SETTINGS */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-xs text-center">
                <img
                  src={userProfile?.profile_photo_url}
                  alt=""
                  className="w-20 h-20 rounded-full mx-auto border-2 border-[#F4C542] object-cover mb-3"
                />
                <h2 className="text-lg font-bold text-[#111111]">{userProfile?.full_name}</h2>
                <span className="text-xs text-[#6B7280]">Class of {userProfile?.passing_year} • Adm: {userProfile?.admission_number}</span>

                <div className="mt-4 p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl text-xs space-y-1.5 text-left">
                  <div>Mobile: <strong>{userProfile?.mobile}</strong></div>
                  <div>Email: <strong>{userProfile?.email}</strong></div>
                  <div>City: <strong>{userProfile?.current_city || 'N/A'}</strong></div>
                  <div>Profession: <strong>{userProfile?.profession || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-xs text-[#111111]">PRIVACY & APP SETTINGS</h3>

                <div className="flex items-center justify-between text-xs py-2 border-b border-[#E5E7EB]">
                  <span>Show Email to Batchmates</span>
                  <input
                    type="checkbox"
                    checked={userProfile?.email_visible || false}
                    onChange={async (e) => {
                      await mobileApi.updateProfile({ email_visible: e.target.checked });
                      loadUserProfile();
                    }}
                    className="w-4 h-4 text-[#F4C542] rounded"
                  />
                </div>

                <button
                  onClick={() => {
                    mobileApi.clearToken();
                    setToken(null);
                    setScreen('WELCOME');
                  }}
                  className="w-full text-xs font-bold text-rose-600 py-2.5 flex items-center justify-center space-x-2 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Mobile App</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tab Navigation Bar */}
        <div className="bg-white border-t border-[#E5E7EB] px-3 py-2 flex items-center justify-around sticky bottom-0 z-20">
          {[
            { id: 'HOME', label: 'Home', icon: Home },
            { id: 'BATCH', label: 'Batch', icon: Users },
            { id: 'EVENTS', label: 'Events', icon: Calendar },
            { id: 'MEMORIES', label: 'Memories', icon: ImageIcon },
            { id: 'PROFILE', label: 'Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                  isActive ? 'text-[#111111] font-bold scale-105' : 'text-[#6B7280] font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl ${isActive ? 'bg-[#FFF7D6] text-[#111111]' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MEMBER PROFILE DETAIL DRAWER */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end animate-fadeIn">
            <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 animate-slideUp">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="font-bold text-base text-[#111111]">Batchmate Profile</h3>
                <button onClick={() => setSelectedMember(null)} className="text-xs font-bold text-gray-400">Close</button>
              </div>

              <div className="flex items-center space-x-4">
                <img src={selectedMember.profile_photo_url} alt="" className="w-16 h-16 rounded-full border border-[#E5E7EB] object-cover" />
                <div>
                  <h4 className="font-bold text-base text-[#111111]">{selectedMember.full_name}</h4>
                  <span className="text-xs text-[#6B7280]">Batch {selectedMember.passing_year} (Sec {selectedMember.section})</span>
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4 text-xs space-y-2">
                <div>Profession: <strong>{selectedMember.profession || 'N/A'}</strong></div>
                <div>Current City: <strong>{selectedMember.current_city || 'N/A'}</strong></div>
                <div>Email: <strong>{selectedMember.email}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* RSVP & GUEST COUNT MODAL */}
        {showRsvpModal && selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end animate-fadeIn">
            <div className="bg-white w-full rounded-t-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="font-bold text-base text-[#111111]">RSVP & Guest Count</h3>
                <button onClick={() => setShowRsvpModal(false)} className="text-xs font-bold text-gray-400">Close</button>
              </div>

              <div className="text-xs text-[#6B7280]">
                Event: <strong className="text-[#111111]">{selectedEvent.title}</strong>
              </div>

              {/* Guest Count Steppers */}
              <div className="space-y-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#111111]">Alumni & Adults</div>
                    <span className="text-[10px] text-[#6B7280]">Self + Adult Spouses</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{adultsCount}</span>
                    <button
                      onClick={() => setAdultsCount(adultsCount + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                  <div>
                    <div className="text-xs font-bold text-[#111111]">Children</div>
                    <span className="text-[10px] text-[#6B7280]">Kids attending</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{kidsCount}</span>
                    <button
                      onClick={() => setKidsCount(kidsCount + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleConfirmRSVP('ATTENDING')}
                disabled={rsvpSubmitting}
                className="w-full bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold py-3.5 rounded-2xl text-xs active-press"
              >
                {rsvpSubmitting ? 'Storing RSVP...' : `Confirm RSVP (${adultsCount + kidsCount} Guests Total)`}
              </button>
            </div>
          </div>
        )}

        {/* EVENT QR TICKET MODAL */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="font-bold text-sm text-[#111111]">Event Entry QR Ticket</h3>
                <button onClick={() => setShowQrModal(false)} className="text-xs font-bold text-gray-400">Close</button>
              </div>

              <div className="bg-[#FAFAFA] border-2 border-dashed border-[#F4C542] rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="w-36 h-36 bg-[#111111] rounded-2xl p-3 flex items-center justify-center text-white font-mono text-[10px] break-all leading-tight">
                  <QrCode className="w-28 h-28 text-[#F4C542]" />
                </div>
                <span className="text-[10px] text-[#6B7280] font-semibold mt-3">Present at venue entrance</span>
              </div>

              <div className="text-xs font-bold text-[#111111]">{userProfile?.full_name}</div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] font-bold text-xs py-2.5 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* PHOTO UPLOAD MODAL */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end animate-fadeIn">
            <form onSubmit={handlePhotoUpload} className="bg-white w-full rounded-t-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="font-bold text-base text-[#111111]">Upload Event Memory</h3>
                <button type="button" onClick={() => setUploadModalOpen(false)} className="text-xs font-bold text-gray-400">Close</button>
              </div>

              <input
                type="text"
                placeholder="Photo Title / Caption..."
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2 text-xs"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-2 text-xs"
                required
              />

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#F4C542] text-[#111111] font-bold py-3.5 rounded-2xl text-xs"
              >
                {uploading ? 'Uploading Photo...' : 'Publish Memory Photo'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
      {/* Device Frame Viewport Toggle Header */}
      <div className="mb-4 flex items-center space-x-3">
        <span className="text-xs text-gray-400 font-semibold">ALUMNI MOBILE PREVIEW</span>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="bg-[#222222] border border-gray-700 text-xs text-white px-3 py-1 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          {isPhoneFrame ? 'Expand Full View' : 'Phone Device Frame'}
        </button>
      </div>

      {/* Device Outer Frame Container */}
      <div
        className={`transition-all duration-300 overflow-hidden flex flex-col ${
          isPhoneFrame
            ? 'w-full max-w-[390px] h-[812px] rounded-[48px] border-[10px] border-[#222222] shadow-2xl relative'
            : 'w-full max-w-2xl h-[85vh] rounded-3xl border border-gray-800 shadow-xl'
        }`}
      >
        {renderAppContent()}
      </div>
    </div>
  );
};
