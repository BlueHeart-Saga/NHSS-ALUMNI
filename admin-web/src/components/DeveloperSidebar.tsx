import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Building2, UserPlus, Layers, LogOut, Terminal, Key, Menu, X } from 'lucide-react';
import { api } from '../services/api';

interface DeveloperSidebarProps {
  onLogout: () => void;
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({ onLogout }) => {
  const [devMobile, setDevMobile] = useState<string>(() => localStorage.getItem('developer_mobile') || '');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  React.useEffect(() => {
    api.getDeveloperInfo().then((info) => {
      if (info && info.mobile) {
        setDevMobile(info.mobile);
        localStorage.setItem('developer_mobile', info.mobile);
      }
    }).catch(() => {
      api.getMe().then((user) => {
        if (user && user.mobile) {
          setDevMobile(user.mobile);
          localStorage.setItem('developer_mobile', user.mobile);
        }
      }).catch(() => {});
    });
  }, []);

  const navItems = [
    { label: 'Platform Dashboard', path: '/developer', icon: Layers },
    { label: 'Schools Management', path: '/developer/schools', icon: Building2 },
    { label: 'Provision Admins', path: '/developer/school-admins', icon: UserPlus },
    { label: 'System Audit Logs', path: '/developer/audit-logs', icon: Terminal },
  ];

  return (
    <>
      {/* Mobile Header Bar Toggle for Developer Portal */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm text-[#111111]">Developer Portal</span>
        </div>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-xl bg-gray-100 text-[#111111] hover:bg-gray-200 transition-all"
          aria-label="Toggle Navigation"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E5E7EB] min-h-screen flex flex-col justify-between p-4 h-screen text-[#111111] transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Developer Portal Branding Header */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-[#E5E7EB] mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white font-extrabold flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-[#111111] text-base leading-tight">Developer Portal</h1>
                <span className="text-[11px] text-[#6B7280] font-semibold">Super-Admin Terminal</span>
              </div>
            </div>
            <button onClick={() => setIsOpenMobile(false)} className="lg:hidden text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpenMobile(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                      isActive
                        ? 'bg-[#111111] text-white font-bold shadow-xs'
                        : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111111]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Developer Actions & Logout */}
        <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-[11px] text-[#111111]">
            <div className="font-bold text-[#111111] mb-0.5 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-[#111111]" />
              <span>Developer Access Active</span>
            </div>
            <div className="text-[#6B7280] text-[10px]">Mobile: <strong>{devMobile || localStorage.getItem('developer_mobile') || ''}</strong></div>
          </div>

          <button
            onClick={() => {
              api.clearToken();
              onLogout();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Exit Developer Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
