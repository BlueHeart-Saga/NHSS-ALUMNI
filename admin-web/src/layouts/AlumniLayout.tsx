import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Users, Compass, MessageSquare, GraduationCap, 
  Calendar, Bell, Camera, Award, Settings, LogOut, Menu, X, Search,
  ChevronLeft, ChevronRight, CheckCircle2, Sparkles
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
  const { logoUrl } = useLanguage();

  const [user, setUser] = useState<AlumniProfile | null>(null);
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Sidebar Collapse & Mobile Drawer state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Header Search & Notifications Popover
  const [headerSearch, setHeaderSearch] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const fetchMe = () => {
    api.getMe()
      .then(setUser)
      .catch((err) => {
        console.error('Alumni auth failed:', err);
        api.clearToken();
        navigate('/login');
      })
      .finally(() => setLoading(false));
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
                <h1 className="font-extrabold text-sm sm:text-base text-[#111111]">{school?.name || 'Alumni Portal'}</h1>
                <CheckCircle2 className="w-4 h-4 text-amber-500 fill-amber-100" />
              </div>
              <span className="text-[11px] text-[#6B7280]">Class of {user?.passing_year || 'Alumni'}</span>
            </div>
          </div>
        </div>

        {/* Middle: Global Header Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search directory, events, notices..."
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
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-4 z-50 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <h4 className="font-bold text-[#111111]">Notifications</h4>
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
              <span className="text-[10px] text-[#854D0E] font-semibold bg-[#FFF7D6] px-1.5 py-0.2 rounded-full">Verified Alumnus</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
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
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">MAIN</p>}
              <div className="space-y-1">
                <NavLink to="/alumni" end className={navItemClass} title="Dashboard">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </NavLink>
                <NavLink to="/alumni/profile" className={navItemClass} title="My Profile">
                  <User className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>My Profile</span>}
                </NavLink>
                <NavLink to="/alumni/batch" className={navItemClass} title="My Batches">
                  <Users className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>My Batches</span>}
                </NavLink>
              </div>
            </div>

            {/* SECTION 2: CONNECT */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">CONNECT</p>}
              <div className="space-y-1">
                <NavLink to="/alumni/directory" className={navItemClass} title="Alumni Directory">
                  <Compass className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Alumni Directory</span>}
                </NavLink>
                <NavLink to="/alumni/school-events" className={navItemClass} title="School Events">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>School Events</span>}
                </NavLink>
              </div>
            </div>

            {/* SECTION 3: ACTIVITIES */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">ACTIVITIES</p>}
              <div className="space-y-1">
                <NavLink to="/alumni/events" className={navItemClass} title="Events">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Events</span>}
                </NavLink>
                <NavLink to="/alumni/announcements" className={navItemClass} title="Announcements">
                  <Bell className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Announcements</span>}
                </NavLink>
                <NavLink to="/alumni/gallery" className={navItemClass} title="Gallery & Memories">
                  <Camera className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Gallery & Memories</span>}
                </NavLink>
              </div>
            </div>

            {/* SECTION 4: MY ACCOUNT */}
            <div>
              {!sidebarCollapsed && <p className="px-3 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">MY ACCOUNT</p>}
              <div className="space-y-1">
                <NavLink to="/alumni/documents" className={navItemClass} title="Certificates / Docs">
                  <Award className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Certificates / Docs</span>}
                </NavLink>
                <NavLink to="/alumni/notifications" className={navItemClass} title="Notifications">
                  <Bell className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Notifications</span>}
                </NavLink>
                <NavLink to="/alumni/settings" className={navItemClass} title="Settings">
                  <Settings className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Settings</span>}
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
          <Outlet context={{ user, school, setUser, refreshUser: fetchMe }} />
        </main>

      </div>

    </div>
  );
};
