import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Building2, UserPlus, Layers, LogOut, Terminal, Key } from 'lucide-react';
import { api } from '../services/api';

interface DeveloperSidebarProps {
  onLogout: () => void;
}

export const DeveloperSidebar: React.FC<DeveloperSidebarProps> = ({ onLogout }) => {
  const [devMobile, setDevMobile] = React.useState<string>(() => localStorage.getItem('developer_mobile') || '');

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
    <aside className="w-64 bg-white border-r border-[#E5E7EB] min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen z-30 text-[#111111]">
      <div>
        {/* Developer Portal Branding Header */}
        <div className="flex items-center space-x-3 px-3 py-4 border-b border-[#E5E7EB] mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-white font-extrabold flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-[#111111] text-base leading-tight">Developer Portal</h1>
            <span className="text-[11px] text-[#6B7280] font-semibold">Super-Admin Terminal</span>
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
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-[#111111] text-white font-bold shadow-xs'
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
          <LogOut className="w-4 h-4" />
          <span>Exit Developer Portal</span>
        </button>
      </div>
    </aside>
  );
};
