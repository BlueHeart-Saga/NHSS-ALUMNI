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
    api.logout('/admin/login');
  };

  useEffect(() => {
    if (!api.getToken()) {
      handleLogout();
      return;
    }
    api.getMe()
      .then((u) => {
        const upperRoles = (u.roles || []).map((r) => String(r).toUpperCase());
        if (!upperRoles.includes('SCHOOL_ADMIN') && !upperRoles.includes('SUPER_ADMIN')) {
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

  // Returns a translation KEY (not the string itself) — Header will resolve it via t().
  const getPageTitleKey = (pathname: string) => {
    if (pathname.includes('/school-admin/alumni/import')) return 'admin_page_title_csv_import';
    if (pathname.includes('/school-admin/alumni')) return 'admin_page_title_alumni_directory';
    if (pathname.includes('/school-admin/verification')) return 'admin_page_title_verification';
    if (pathname.includes('/school-admin/batches')) return 'admin_page_title_batches';
    if (pathname.includes('/school-admin/events/create')) return 'admin_page_title_create_event';
    if (pathname.includes('/school-admin/school-events')) return 'admin_page_title_school_events';
    if (pathname.includes('/school-admin/events')) return 'admin_page_title_events';
    if (pathname.includes('/school-admin/announcements')) return 'admin_page_title_announcements';
    if (pathname.includes('/school-admin/memories')) return 'admin_page_title_memories';
    if (pathname.includes('/school-admin/association-team')) return 'admin_page_title_association';
    if (pathname.includes('/school-admin/rank-holders')) return 'admin_page_title_rank_holders';
    if (pathname.includes('/school-admin/reports')) return 'admin_page_title_reports';
    if (pathname.includes('/school-admin/settings')) return 'admin_page_title_settings';
    if (pathname.includes('/school-admin/audit')) return 'admin_audit_page_title';
    if (pathname.includes('/school-admin/contributions')) return 'admin_contributions_page_title';
    if (pathname.includes('/school-admin/sponsors')) return 'admin_sponsors_page_title';
    return 'admin_page_title_overview';
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="pt-14 lg:pt-0">
          <Header user={user} titleKey={getPageTitleKey(location.pathname)} />
        </div>
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};