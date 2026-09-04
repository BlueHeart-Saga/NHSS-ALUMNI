import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, Calendar, Sparkles,
  Megaphone, Image as ImageIcon, BarChart3, Settings, LogOut, Award, Trophy 
} from 'lucide-react';
import { SchoolProfile } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { t, logoUrl } = useLanguage();
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    api.getSchoolProfile().then(setSchool).catch(console.error);
  }, []);

  const navItems = [
    { label: t('admin_dashboard'), path: '/school-admin', icon: LayoutDashboard },
    { label: t('admin_verification'), path: '/school-admin/verification', icon: UserCheck },
    { label: t('admin_alumni_directory'), path: '/school-admin/alumni', icon: Users },
    { label: t('admin_batches'), path: '/school-admin/batches', icon: GraduationCap },
    { label: t('admin_events'), path: '/school-admin/events', icon: Calendar },
    { label: t('admin_school_events'), path: '/school-admin/school-events', icon: Sparkles },
    { label: t('admin_announcements'), path: '/school-admin/announcements', icon: Megaphone },
    { label: t('admin_memories'), path: '/school-admin/memories', icon: ImageIcon },
    { label: t('admin_association_team'), path: '/school-admin/association-team', icon: Award },
    { label: t('admin_rank_holders'), path: '/school-admin/rank-holders', icon: Trophy },
    { label: t('admin_reports'), path: '/school-admin/reports', icon: BarChart3 },
    { label: t('admin_settings'), path: '/school-admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header Toggle Bar (Visible on < lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E7EB] z-40 px-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img src={logoUrl} alt="School Logo" className="w-8 h-8 object-contain rounded-lg shrink-0" />
          <div className="min-w-0">
            <h1 className="font-bold text-[#111111] text-sm truncate leading-tight">{school?.name || t('app_title')}</h1>
            <span className="text-[10px] text-[#6B7280] block truncate">{t('admin_portal_name')}</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl border border-[#E5E7EB] bg-gray-50 text-[#111111] hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-45 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Responsive Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:z-30 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* School Branding Header */}
          <div className="flex items-center space-x-3 px-3 py-4 border-b border-[#E5E7EB] mb-6">
            <img src={logoUrl} alt="School Logo" className="w-10 h-10 object-contain rounded-xl shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-[#111111] text-base leading-tight truncate">{school?.name || t('app_title')}</h1>
              <span className="text-xs text-[#6B7280] block truncate">{t('admin_portal_name')}</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-[#FFF7D6] text-[#111111] border border-[#F4C542]/40 font-semibold shadow-2xs'
                        : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111111]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-[#E5E7EB] mt-6">
          <button
            onClick={() => {
              setIsMobileOpen(false);
              onLogout();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-600 shrink-0" />
            <span className="truncate">{t('nav_logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
