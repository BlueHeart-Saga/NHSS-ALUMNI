import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, Calendar, 
  CheckCircle, Megaphone, Image as ImageIcon, BarChart3, Settings, LogOut, Shield
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SchoolProfile } from '../types';
import { api } from '../services/api';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [school, setSchool] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    api.getSchoolProfile().then(setSchool).catch(console.error);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/school-admin', icon: LayoutDashboard },
    { label: 'Verification Queue', path: '/school-admin/verification', icon: UserCheck },
    { label: 'Alumni Directory', path: '/school-admin/alumni', icon: Users },
    { label: 'Batches Cohorts', path: '/school-admin/batches', icon: GraduationCap },
    { label: 'Events & Reunion', path: '/school-admin/events', icon: Calendar },
    { label: 'Announcements', path: '/school-admin/announcements', icon: Megaphone },
    { label: 'Memories Moderation', path: '/school-admin/memories', icon: ImageIcon },
    { label: 'Reports & Export', path: '/school-admin/reports', icon: BarChart3 },
    { label: 'School Settings', path: '/school-admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen z-30">
      <div>
        {/* School Branding Header */}
        <div className="flex items-center space-x-3 px-3 py-4 border-b border-[#E5E7EB] mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7D6] text-[#111111] font-bold flex items-center justify-center border border-[#F4C542]">
            {school?.code || 'SCH'}
          </div>
          <div>
            <h1 className="font-bold text-[#111111] text-base leading-tight">{school?.name || 'School Portal'}</h1>
            <span className="text-xs text-[#6B7280]">Alumni Admin Portal</span>
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

      {/* Logout Action */}
      <div className="pt-4 border-t border-[#E5E7EB]">
        <button
          onClick={() => {
            api.clearToken();
            onLogout();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
