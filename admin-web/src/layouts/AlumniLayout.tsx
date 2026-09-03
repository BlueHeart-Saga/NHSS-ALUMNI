import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Users, Compass, MessageSquare, GraduationCap, 
  Calendar, Bell, Camera, Award, Settings, LogOut, Menu, X, Search,
  ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Clock, ShieldAlert,
  AlertTriangle, RefreshCw, Mail
} from 'lucide-react';
import { api } from '../services/api';
import { AlumniProfile, SchoolProfile } from '../types';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export interface AlumniContextType {
  user: AlumniProfile | null;
  school: SchoolProfile | null;
  setUser: React.Dispatch<React.SetStateAction<AlumniProfile | null>>;
  refreshUser: () => void;
}

export const AlumniLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, logoUrl, language } = useLanguage();

  const [user, setUser] = useState<AlumniProfile | null>(null);
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Sidebar Collapse & Mobile Drawer state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Header Search & Notifications Popover
  const [headerSearch, setHeaderSearch] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const fetchMe = () => {
    setRefreshing(true);
    api.getMe()
      .then(setUser)
      .catch((err) => {
        console.error('Alumni auth failed:', err);
        api.clearToken();
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    if (!api.getToken()) {
      navigate('/login');
      return;
    }
    fetchMe();
    api.getSchoolProfile().then(setSchool).catch(console.error);
  }, [navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    api.clearToken();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/alumni/directory?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch('');
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-[#111111] text-white shadow-sm font-semibold'
        : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111111]'
    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`;

  if (loading) {
    return (
      <div className="h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-[#111111]">
        <div className="w-10 h-10 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-semibold text-xs text-[#6B7280]">Loading Portal Layout...</p>
      </div>
    );
  }

  const isApproved = user?.verification_status === 'APPROVED';

  // =========================================================================
  // UNVERIFIED USER VIEW: CLEAN PAGE WITHOUT NAVBAR OR SIDEBAR
  // =========================================================================
  if (!isApproved) {
    const isPending = !user?.verification_status || user?.verification_status === 'PENDING' || user?.verification_status === 'NOT_REGISTERED';
    const isRejected = user?.verification_status === 'REJECTED';
    const isSuspended = user?.verification_status === 'SUSPENDED';

    return (
      <div className="min-h-screen w-screen bg-[#FAFAFA] text-[#111111] flex flex-col font-sans selection:bg-[#F4C542] selection:text-[#111111]">
        
        {/* Top Minimal Bar */}
        <header className="h-16 shrink-0 bg-white border-b border-[#E5E7EB] px-4 sm:px-8 flex items-center justify-between shadow-xs z-20">
          <div className="flex items-center space-x-3">
            <img
              src={school?.logo_url || logoUrl}
              alt="School Logo"
              className="w-10 h-10 object-contain rounded-xl"
            />
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-[#111111] tracking-tight">
                {school?.name || 'Alumni Association Portal'}
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                {language === 'ta' ? 'அதிகாரப்பூர்வ பழைய மாணவர்கள் தளம்' : 'Official Alumni Member Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">{language === 'ta' ? 'வெளியேறு' : 'Log Out'}</span>
            </button>
          </div>
        </header>

        {/* Main Center Area with Awaiting Approval Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="max-w-2xl w-full bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center animate-fadeIn relative overflow-hidden">
            
            {/* Soft Ambient Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#F4C542]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

            {/* Status Icon */}
            <div className="flex justify-center">
              {isPending && (
                <div className="w-20 h-20 bg-[#FFF7D6] border-4 border-[#F4C542]/50 rounded-3xl flex items-center justify-center text-[#854D0E] shadow-sm">
                  <Clock className="w-10 h-10 text-[#854D0E] animate-pulse" />
                </div>
              )}
              {isRejected && (
                <div className="w-20 h-20 bg-rose-50 border-4 border-rose-200 rounded-3xl flex items-center justify-center text-rose-600 shadow-sm">
                  <AlertTriangle className="w-10 h-10 text-rose-600" />
                </div>
              )}
              {isSuspended && (
                <div className="w-20 h-20 bg-amber-50 border-4 border-amber-200 rounded-3xl flex items-center justify-center text-amber-600 shadow-sm">
                  <ShieldAlert className="w-10 h-10 text-amber-600" />
                </div>
              )}
            </div>

            {/* Status Pill */}
            <div className="flex justify-center">
              {isPending && (
                <span className="bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/70 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#854D0E] animate-ping" />
                  {language === 'ta' ? 'பள்ளி நிர்வாகியின் அனுமதி நிலுவையில் உள்ளது' : 'Awaiting School Admin Verification'}
                </span>
              )}
              {isRejected && (
                <span className="bg-rose-100 text-rose-800 border border-rose-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {language === 'ta' ? 'பதிவு நிராகரிக்கப்பட்டது' : 'Registration Rejected'}
                </span>
              )}
              {isSuspended && (
                <span className="bg-amber-100 text-amber-800 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {language === 'ta' ? 'கணக்கு இடைநிறுத்தப்பட்டுள்ளது' : 'Account Suspended'}
                </span>
              )}
            </div>

            {/* Main Headline & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                {isPending && (language === 'ta'
                  ? `வணக்கம் ${user?.full_name || ''}! உங்கள் அனுமதி நிலுவையில் உள்ளது`
                  : `Welcome, ${user?.full_name || 'Alumni Member'}!`)}
                {isRejected && (language === 'ta' ? 'பதிவு விண்ணப்பம் நிராகரிக்கப்பட்டது' : 'Registration Application Rejected')}
                {isSuspended && (language === 'ta' ? 'கணக்கு தற்காலிகமாக இடைநிறுத்தப்பட்டுள்ளது' : 'Account Access Suspended')}
              </h2>

              <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed font-normal">
                {isPending && (language === 'ta'
                  ? 'உங்கள் விவரங்கள் பள்ளி நிர்வாகிகளுக்குச் சமர்ப்பிக்கப்பட்டுள்ளன. பள்ளி நிர்வாகி உங்கள் தகவல்களைச் சரிபார்த்து அனுமதித்த பிறகே பழைய மாணவர் தளத்தை அணுக முடியும். தயவுசெய்து காத்திருக்கவும்.'
                  : 'Your alumni registration details have been submitted successfully! School Association Admin will review and verify your details before granting access to explore the Alumni Portal. Please wait for approval.')}
                {isRejected && (language === 'ta' ? 'உங்கள் தகவல்கள் பள்ளி பதிவுகளுடன் பொருந்தவில்லை. கூடுதல் விவரங்களுக்கு பள்ளி நிர்வாகியைத் தொடர்பு கொள்ளவும்.' : 'Your registration details could not be verified against official school records. Please contact your school administrator.')}
                {isSuspended && (language === 'ta' ? 'உங்கள் பழைய மாணவர் கணக்கு தற்காலிகமாக இடைநிறுத்தப்பட்டுள்ளது.' : 'Your alumni portal account access has been suspended by the school administrator.')}
              </p>
            </div>

            {/* Application Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-[#111111] uppercase tracking-wider text-[11px] flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1.5 text-[#854D0E]" />
                  {language === 'ta' ? 'சமர்ப்பிக்கப்பட்ட விவரங்கள்' : 'Submitted Registration Summary'}
                </span>
                <span className="text-gray-500 font-mono text-[11px]">
                  Ref: {user?.admission_number || 'REG-PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <div>
                  <span className="text-gray-400 block text-[11px]">{language === 'ta' ? 'பெயர்:' : 'Full Name:'}</span>
                  <span className="font-semibold text-[#111111]">{user?.full_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">{language === 'ta' ? 'படித்த வகுப்புத் தொகுதி:' : 'Batch Year:'}</span>
                  <span className="font-semibold text-[#111111]">Batch of {user?.passing_year || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">{language === 'ta' ? 'மின்னஞ்சல்:' : 'Email Address:'}</span>
                  <span className="font-semibold text-[#111111]">{user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">{language === 'ta' ? 'கைபேசி எண்:' : 'Mobile Number:'}</span>
                  <span className="font-semibold text-[#111111]">{user?.mobile || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={fetchMe}
                disabled={refreshing}
                className="w-full sm:w-auto px-6 py-3 bg-[#F4C542] hover:bg-[#E5B532] text-[#111111] font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-[#111111] ${refreshing ? 'animate-spin' : ''}`} />
                <span>
                  {refreshing
                    ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Checking Status...')
                    : (language === 'ta' ? 'சரிபார்ப்பு நிலையை மீண்டும் சரிபார்க்க' : 'Check Verification Status')}
                </span>
              </button>

              <button
                onClick={() => {
                  window.location.href = `mailto:${school?.contact_email || 'support@justgathernow.com'}?subject=Alumni Verification Request - ${user?.full_name}`;
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#E5E7EB] hover:border-[#111111] text-[#111111] font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-gray-600" />
                <span>{language === 'ta' ? 'பள்ளி நிர்வாகியைத் தொடர்பு கொள்ள' : 'Contact School Admin'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                <span>{language === 'ta' ? 'வெளியேறு' : 'Log Out'}</span>
              </button>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#FAFAFA] text-[#111111] flex flex-col overflow-hidden font-sans">


      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (FIXED HEIGHT, NEVER MOVES OR SHIFTS) */}
      {/* ========================================================================= */}
      <header className="h-16 shrink-0 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 z-30 flex items-center justify-between shadow-sm">
        
        {/* Left: Mobile Toggle, Desktop Expand/Collapse & School Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#F3F4F6] text-[#111111] hover:bg-[#E5E7EB]"
            title="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6] transition-all"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => navigate('/alumni')}>
            <img
              src={school?.logo_url || logoUrl}
              alt="School Logo"
              className="w-9 h-9 object-contain rounded-xl"
            />
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-sm sm:text-base text-[#111111]">{t('app_title')}</h1>
                <CheckCircle2 className="w-4 h-4 text-amber-500 fill-amber-100" />
              </div>
              <span className="text-[11px] text-[#6B7280]">{t('alumni_class_of')} {user?.passing_year || 'Alumni'}</span>
            </div>
          </div>
        </div>

        {/* Middle: Global Header Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('alumni_search_placeholder')}
            value={headerSearch}
            onChange={e => setHeaderSearch(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#F4C542] transition-all"
          />
        </form>

        {/* Right: Actions, Language & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <LanguageSelector />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111] hover:bg-[#F3F4F6] relative"
              title={t('alumni_nav_notifications')}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-4 z-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <h4 className="font-bold text-[#111111]">{t('alumni_nav_notifications')}</h4>
                  <button onClick={() => { setShowNotificationsDropdown(false); navigate('/alumni/notifications'); }} className="text-amber-800 font-bold text-[11px] hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                    <p className="font-bold text-[#111111]">Grand Reunion 2026</p>
                    <p className="text-gray-500 text-[11px]">RSVP is open for upcoming gathering.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
                    <p className="font-bold text-[#111111]">Connection Request</p>
                    <p className="text-gray-500 text-[11px]">Kavitha R accepted your request.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile avatar */}
          <div className="flex items-center space-x-3 pl-3 border-l border-[#E5E7EB]">
            <img
              src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'Alumni'}&background=111111&color=ffffff`}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB] cursor-pointer"
              onClick={() => navigate('/alumni/profile')}
            />
            <div className="hidden sm:block text-left cursor-pointer" onClick={() => navigate('/alumni/profile')}>
              <p className="font-bold text-xs text-[#111111] line-clamp-1">{user?.full_name || 'Alumni'}</p>
              {isApproved ? (
                <span className="text-[10px] text-[#854D0E] font-semibold bg-[#FFF7D6] px-1.5 py-0.2 rounded-full">{t('alumni_verified_badge')}</span>
              ) : (
                <span className="text-[10px] text-[#854D0E] font-bold bg-[#FFF7D6] border border-[#F4C542]/60 px-1.5 py-0.2 rounded-full animate-pulse">
                  {language === 'ta' ? 'அனுமதி நிலுவையில் உள்ளது' : 'Awaiting Approval'}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title={t('nav_logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT (SIDEBAR & MAIN AREA AT FULL REMAINING HEIGHT) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          ></div>
        )}

        {/* 2A. SIDEBAR COMPONENT (INDEPENDENT SCROLL, ZERO NAVBAR IMPACT) */}
        <aside className={`
          h-full overflow-y-auto flex flex-col border-r border-[#E5E7EB] bg-white shrink-0 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl translate-x-0' : 'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full lg:translate-x-0 lg:static'}
        `}>
          <nav className="flex-1 p-4 space-y-6 text-xs">
            
            {/* SECTION 1: MAIN */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">{t('alumni_section_main')}</p>}
              <div className="space-y-1">
                <NavLink to="/alumni" end className={navItemClass} title={t('alumni_nav_dashboard')}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_dashboard')}</span>}
                </NavLink>
                <NavLink to="/alumni/profile" className={navItemClass} title={t('alumni_nav_profile')}>
                  <User className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_profile')}</span>}
                </NavLink>
                <NavLink to="/alumni/batch" className={navItemClass} title={t('alumni_nav_batches')}>
                  <Users className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_batches')}</span>}
                </NavLink>
              </div>
            </div>

            {/* SECTION 2: CONNECT */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">{t('alumni_section_connect')}</p>}
              <div className="space-y-1">
                <NavLink to="/alumni/directory" className={navItemClass} title={t('alumni_nav_directory')}>
                  <Compass className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_directory')}</span>}
                </NavLink>
                <NavLink to="/alumni/school-events" className={navItemClass} title={t('alumni_nav_school_events')}>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_school_events')}</span>}
                </NavLink>
              </div>
            </div>

            {/* SECTION 3: ACTIVITIES */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">{t('alumni_section_activities')}</p>}
              <div className="space-y-1">
                <NavLink to="/alumni/events" className={navItemClass} title={t('alumni_nav_events')}>
                  <Calendar className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_events')}</span>}
                </NavLink>
                <NavLink to="/alumni/announcements" className={navItemClass} title={t('alumni_nav_announcements')}>
                  <Bell className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_announcements')}</span>}
                </NavLink>
                <NavLink to="/alumni/gallery" className={navItemClass} title={t('alumni_nav_gallery')}>
                  <Camera className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_gallery')}</span>}
                </NavLink>
              </div>
            </div>

            {/* SECTION 4: MY ACCOUNT */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">{t('alumni_section_account')}</p>}
              <div className="space-y-1">
                <NavLink to="/alumni/documents" className={navItemClass} title={t('alumni_nav_documents')}>
                  <Award className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_documents')}</span>}
                </NavLink>
                <NavLink to="/alumni/notifications" className={navItemClass} title={t('alumni_nav_notifications')}>
                  <Bell className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_notifications')}</span>}
                </NavLink>
                <NavLink to="/alumni/settings" className={navItemClass} title={t('alumni_nav_settings')}>
                  <Settings className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t('alumni_nav_settings')}</span>}
                </NavLink>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] text-[11px] text-[#6B7280] shrink-0">
              <p className="font-semibold text-[#111111] truncate">{school?.name || 'Alumni Network'}</p>
              <p className="mt-0.5">{school?.city ? `${school.city}, ${school.state || 'India'}` : 'Alumni Platform'}</p>
            </div>
          )}
        </aside>

        {/* 2B. MAIN CONTENT AREA (INDEPENDENT SCROLL) */}
        <main className="flex-1 h-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FAFAFA]">
          {/* Awaiting Admin Verification Top Banner Bar */}
          {!isApproved && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#FFF7D6] via-amber-50 to-[#FFF7D6] border-2 border-[#F4C542] rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 bg-[#F4C542] rounded-xl flex items-center justify-center text-[#854D0E] shrink-0 shadow-xs mt-0.5 sm:mt-0">
                  <Clock className="w-5 h-5 text-[#854D0E] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-[#111111]">
                      {language === 'ta' ? 'பள்ளி நிர்வாகியின் அனுமதி நிலுவையில் உள்ளது' : 'Awaiting School Admin Verification'}
                    </h3>
                    <span className="bg-[#854D0E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {user?.verification_status || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-normal leading-relaxed">
                    {language === 'ta'
                      ? 'உங்கள் பழைய மாணவர் கணக்கு விவரங்கள் பள்ளி சங்க நிர்வாகிகளுக்குச் சமர்ப்பிக்கப்பட்டுள்ளன. பள்ளி நிர்வாகி உங்கள் தகவல்களைச் சரிபார்த்து அனுமதித்தவுடன் முழு சரிபார்க்கப்பட்ட முத்திரை வழங்கப்பட்டு சுயவிவரம் செயல்படுத்தப்படும்.'
                      : 'Your alumni profile is registered and submitted to the School Association Admin. Once verified by your school administrator, your official verified badge & directory features will be fully activated.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={fetchMe}
                  disabled={refreshing}
                  className="px-4 py-2 bg-[#111111] hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Checking...') : (language === 'ta' ? 'நிலையைச் சரிபார்க்க' : 'Check Status')}</span>
                </button>
              </div>
            </div>
          )}

          <Outlet context={{ user, school, setUser, refreshUser: fetchMe }} />
        </main>


      </div>

    </div>
  );
};
