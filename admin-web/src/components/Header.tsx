import React from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';
import { AlumniProfile } from '../types';

interface HeaderProps {
  user: AlumniProfile | null;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ user, title }) => {
  return (
    <header className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-[#111111]">{title}</h2>
        <p className="text-xs text-[#6B7280]">School Alumni Management System</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search alumni, batch..."
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white transition-all"
          />
        </div>

        {/* Status Chip */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-[#FFF7D6] border border-[#F4C542]/50 text-[#854D0E] px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>School Admin</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-[#E5E7EB]">
          <img
            src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=111111&color=ffffff`}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-[#111111]">{user?.full_name || "School Admin"}</div>
            <div className="text-[11px] text-[#6B7280]">{user?.email || user?.mobile || "Administrator"}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
