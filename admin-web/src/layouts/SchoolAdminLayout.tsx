import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { AlumniProfile } from '../types';

export const SchoolAdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AlumniProfile | null>(null);

  const handleLogout = () => {
    api.clearToken();
    navigate('/login');
  };

  useEffect(() => {
    if (!api.getToken()) {
      handleLogout();
      return;
    }
    api.getMe()
      .then((u) => {
        if (!u.roles?.includes('SCHOOL_ADMIN') && !u.roles?.includes('SUPER_ADMIN')) {
          console.warn('Unauthorized access: User does not have School Admin role');
          handleLogout();
        } else {
          setUser(u);
        }
      })
      .catch((err) => {
        console.error('Admin token validation error:', err);
        handleLogout();
      });
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/school-admin/alumni/import')) return 'CSV Alumni Roster Import';
    if (pathname.includes('/school-admin/alumni')) return 'Alumni Directory & Management';
    if (pathname.includes('/school-admin/verification')) return 'Verification Queue';
    if (pathname.includes('/school-admin/batches')) return 'Batches & Cohorts';
    if (pathname.includes('/school-admin/events/create')) return 'Create Reunion Event';
    if (pathname.includes('/school-admin/school-events')) return 'School Events & Celebrations';
    if (pathname.includes('/school-admin/events')) return 'Alumni Events & Get-Togethers';
    if (pathname.includes('/school-admin/announcements')) return 'Announcements Feed';
    if (pathname.includes('/school-admin/memories')) return 'Memories & Photo Moderation';
    if (pathname.includes('/school-admin/association-team')) return 'Association Leadership Team';
    if (pathname.includes('/school-admin/rank-holders')) return 'Academic Rank Holders & Toppers';
    if (pathname.includes('/school-admin/reports')) return 'Reports & Analytics';
    if (pathname.includes('/school-admin/settings')) return 'School Settings';
    return 'School Admin Overview';
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};
