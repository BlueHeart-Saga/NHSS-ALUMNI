import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { api } from '../services/api';
import { AlumniProfile, SchoolProfile } from '../types';

export const AlumniLayout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AlumniProfile | null>(null);
  const [school, setSchool] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    if (!api.getToken()) {
      navigate('/login');
      return;
    }
    api.getMe()
      .then(setUser)
      .catch((err) => {
        console.error('Alumni auth failed:', err);
        api.clearToken();
        navigate('/login');
      });
    api.getSchoolProfile().then(setSchool).catch(console.error);
  }, [navigate]);

  const handleLogout = () => {
    api.clearToken();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex flex-col font-sans">
      <header className="bg-white border-b border-[#E5E7EB] px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7D6] border border-[#F4C542] text-[#111111] font-extrabold text-sm flex items-center justify-center">
            {school?.code || 'SCH'}
          </div>
          <div>
            <h1 className="font-bold text-base text-[#111111]">{school?.name || 'Alumni Portal'}</h1>
            <span className="text-xs text-[#6B7280]">Class of {user?.passing_year || 'Alumni'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="flex space-x-2 text-xs font-bold">
            <NavLink
              to="/alumni"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all ${isActive ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/alumni/batch/members"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all ${isActive ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`
              }
            >
              Batch Members
            </NavLink>
            <NavLink
              to="/alumni/events"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all ${isActive ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`
              }
            >
              Events
            </NavLink>
            <NavLink
              to="/alumni/announcements"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all ${isActive ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`
              }
            >
              Announcements
            </NavLink>
            <NavLink
              to="/alumni/profile"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all ${isActive ? 'bg-[#111111] text-white' : 'text-[#6B7280] hover:text-[#111111]'}`
              }
            >
              Profile
            </NavLink>
          </nav>

          <div className="flex items-center space-x-3 pl-4 border-l border-[#E5E7EB]">
            <img
              src={user?.profile_photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'Alumni'}&background=111111&color=ffffff`}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]"
            />
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <Outlet context={{ user, school }} />
      </main>
    </div>
  );
};
