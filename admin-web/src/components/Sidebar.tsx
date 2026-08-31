import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, Calendar, 
  Megaphone, Image as ImageIcon, BarChart3, Settings, LogOut
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

  useEffect(() => {
    api.getSchoolProfile().then(setSchool).catch(console.error);
  }, []);

  const navItems = [
    { label: t('admin_dashboard'), path: '/school-admin', icon: LayoutDashboard },
    { label: t('admin_verification'), path: '/school-admin/verification', icon: UserCheck },
    { label: t('admin_alumni_directory'), path: '/school-admin/alumni', icon: Users },
    { label: t('admin_batches'), path: '/school-admin/batches', icon: GraduationCap },
    { label: t('admin_events'), path: '/school-admin/events', icon: Calendar },
    { label: t('admin_announcements'), path: '/school-admin/announcements', icon: Megaphone },
    { label: t('admin_memories'), path: '/school-admin/memories', icon: ImageIcon },
    { label: t('admin_reports'), path: '/school-admin/reports', icon: BarChart3 },
    { label: t('admin_settings'), path: '/school-admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen z-30">
      <div>
        {/* School Branding Header */}
        <div className="flex items-center space-x-3 px-3 py-4 border-b border-[#E5E7EB] mb-6">
          <img src={school?.logo_url || logoUrl} alt="School Logo" className="w-10 h-10 object-contain rounded-xl" />
          <div>
            <h1 className="font-bold text-[#111111] text-base leading-tight">{school?.name || t('app_title')}</h1>
            <span className="text-xs text-[#6B7280]">{t('admin_portal_name')}</span>
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
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-[#FFF7D6] text-[#111111] border border-[#F4C542]/40 font-semibold'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111111]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-[#E5E7EB]">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>{t('nav_logout')}</span>
        </button>
      </div>
    </aside>
  );
};
