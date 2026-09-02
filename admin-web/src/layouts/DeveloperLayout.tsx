import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DeveloperSidebar } from '../components/DeveloperSidebar';
import { api } from '../services/api';

export const DeveloperLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.clearToken();
    navigate('/developer/login');
  };

  useEffect(() => {
    if (!api.getToken()) {
      handleLogout();
      return;
    }
    api.getMe()
      .then((u) => {
        const upperRoles = (u.roles || []).map((r) => String(r).toUpperCase());
        if (
          !upperRoles.includes('SUPER_ADMIN') &&
          !upperRoles.includes('DEVELOPER') &&
          !upperRoles.includes('PLATFORM_DEVELOPER')
        ) {
          console.warn('Unauthorized access: User does not have Developer/Super Admin role');
          handleLogout();
        }
      })
      .catch((err) => {
        console.error('Developer token validation error:', err);
        handleLogout();
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-[#111111]">
      <DeveloperSidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
