import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AlumniLayout } from '../layouts/AlumniLayout';
import { SchoolAdminLayout } from '../layouts/SchoolAdminLayout';
import { DeveloperLayout } from '../layouts/DeveloperLayout';

// Public Pages
import { HomePage } from '../pages/public-pages/HomePage';
import { PublicAbout } from '../pages/public-pages/PublicAbout';
import { PublicSchool } from '../pages/public-pages/PublicSchool';
import { PublicBatches } from '../pages/public-pages/PublicBatches';
import { PublicEvents } from '../pages/public-pages/PublicEvents';
import { PublicMemories } from '../pages/public-pages/PublicMemories';
import { PublicContact } from '../pages/public-pages/PublicContact';
import { AlumniLogin } from '../pages/public-pages/AlumniLogin';
import { AlumniRegister } from '../pages/public-pages/AlumniRegister';
import { AuthCallback } from '../pages/public-pages/AuthCallback';
import { Login } from '../pages/public-pages/Login';
import { SchoolAdminRequest } from '../pages/public-pages/SchoolAdminRequest';
import { AdminSetupPassword } from '../pages/public-pages/AdminSetupPassword';
import { DeveloperLogin } from '../pages/developer/DeveloperLogin';

// Alumni Pages
import { AlumniPortal } from '../pages/alumni/AlumniPortal';

// School Admin Pages
import { Dashboard } from '../pages/school-admin/Dashboard';
import { VerificationQueue } from '../pages/school-admin/VerificationQueue';
import { AlumniManagement } from '../pages/school-admin/AlumniManagement';
import { Batches } from '../pages/school-admin/Batches';
import { BatchDetails } from '../pages/school-admin/BatchDetails';
import { EventsList } from '../pages/school-admin/EventsList';
import { CreateEditEvent } from '../pages/school-admin/CreateEditEvent';
import { EventDetails } from '../pages/school-admin/EventDetails';
import { AttendanceRoster } from '../pages/school-admin/AttendanceRoster';
import { AnnouncementsManager } from '../pages/school-admin/AnnouncementsManager';
import { MemoriesModeration } from '../pages/school-admin/MemoriesModeration';
import { ReportsDashboard } from '../pages/school-admin/ReportsDashboard';
import { SchoolSettings } from '../pages/school-admin/SchoolSettings';
import { AssociationTeam } from '../pages/school-admin/AssociationTeam';
import { RankHoldersManager } from '../pages/school-admin/RankHoldersManager';
import { SchoolEventsManager } from '../pages/school-admin/SchoolEventsManager';

// Developer Pages
import { DeveloperPortal } from '../pages/developer/DeveloperPortal';
import { NotFound } from '../pages/common-pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<PublicAbout />} />
        <Route path="school" element={<PublicSchool />} />
        <Route path="batches" element={<PublicBatches />} />
        <Route path="events" element={<PublicEvents />} />
        <Route path="memories" element={<PublicMemories />} />
        <Route path="contact" element={<PublicContact />} />
        <Route path="login" element={<AlumniLogin />} />
        <Route path="register" element={<AlumniRegister />} />
        <Route path="auth/callback" element={<AuthCallback />} />
      </Route>

      {/* Admin & Developer Logins & Access Requests */}
      <Route path="/admin/login" element={<Login onLoginSuccess={(path) => window.location.href = path || '/school-admin'} />} />
      <Route path="/admin/request-access" element={<SchoolAdminRequest />} />
      <Route path="/admin/setup-password" element={<AdminSetupPassword />} />
      <Route path="/developer/login" element={<DeveloperLogin onLoginSuccess={(path) => window.location.href = path || '/developer'} />} />

      {/* 2. ALUMNI STUDENT ROUTES */}
      <Route path="/alumni" element={<AlumniLayout />}>
        <Route index element={<AlumniPortal />} />
        <Route path="profile" element={<AlumniPortal />} />
        <Route path="batch" element={<AlumniPortal />} />
        <Route path="batch/members" element={<AlumniPortal />} />
        <Route path="events" element={<AlumniPortal />} />
        <Route path="events/:eventId" element={<AlumniPortal />} />
        <Route path="announcements" element={<AlumniPortal />} />
        <Route path="memories" element={<AlumniPortal />} />
        <Route path="settings" element={<AlumniPortal />} />
      </Route>

      {/* 3. SCHOOL ADMIN ROUTES */}
      <Route path="/school-admin" element={<SchoolAdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="alumni" element={<AlumniManagement />} />
        <Route path="alumni/:id" element={<AlumniManagement />} />
        <Route path="verification" element={<VerificationQueue />} />
        <Route path="batches" element={<Batches />} />
        <Route path="batches/:batchId" element={<BatchDetails />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/create" element={<CreateEditEvent />} />
        <Route path="events/:eventId" element={<EventDetails />} />
        <Route path="events/:eventId/attendance" element={<AttendanceRoster />} />
        <Route path="school-events" element={<SchoolEventsManager />} />
        <Route path="announcements" element={<AnnouncementsManager />} />
        <Route path="memories" element={<MemoriesModeration />} />
        <Route path="association-team" element={<AssociationTeam />} />
        <Route path="rank-holders" element={<RankHoldersManager />} />
        <Route path="reports" element={<ReportsDashboard />} />
        <Route path="settings" element={<SchoolSettings />} />
      </Route>

      {/* 4. PLATFORM DEVELOPER ROUTES */}
      <Route path="/developer" element={<DeveloperLayout />}>
        <Route index element={<DeveloperPortal />} />
        <Route path="schools" element={<DeveloperPortal />} />
        <Route path="schools/:schoolId" element={<DeveloperPortal />} />
        <Route path="school-admins" element={<DeveloperPortal />} />
        <Route path="users" element={<DeveloperPortal />} />
        <Route path="reports" element={<DeveloperPortal />} />
        <Route path="audit-logs" element={<DeveloperPortal />} />
        <Route path="settings" element={<DeveloperPortal />} />
      </Route>

      {/* Default Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
