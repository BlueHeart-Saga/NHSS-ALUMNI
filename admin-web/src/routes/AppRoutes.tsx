import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuditListPage } from '../pages/public-pages/Audit/AuditListPage';
import { AuditDetailPage } from '../pages/public-pages/Audit/AuditDetailPage';
import { PublicContributorsPage } from '../pages/public-pages/PublicContributorsPage';
import { PublicSponsorsPage } from '../pages/public-pages/PublicSponsorsPage';
// Layouts
import { PublicLayout } from '../layouts/PublicLayout';

import { NewsDetailPage } from '../pages/public-pages/NewsDetailPage';
import { MeetingMinuteDetailPage } from '../pages/public-pages/Audit/MeetingMinuteDetailPage';

// Public Pages (Eagerly Loaded for Immediate First Paint)
import { HomePage } from '../pages/public-pages/HomePage';
import { PublicAbout } from '../pages/public-pages/PublicAbout';
import { PublicSchool } from '../pages/public-pages/PublicSchool';
import { PublicBatches } from '../pages/public-pages/PublicBatches';
import { PublicEvents } from '../pages/public-pages/PublicEvents';
import { PublicMemories } from '../pages/public-pages/PublicMemories';
import { PublicContact } from '../pages/public-pages/PublicContact';
import { PublicFeedback } from '../pages/public-pages/PublicFeedback';
import { PublicTerms } from '../pages/public-pages/PublicTerms';
import { PublicPrivacy } from '../pages/public-pages/PublicPrivacy';
import { AlumniLogin } from '../pages/public-pages/AlumniLogin';
import { AlumniRegister } from '../pages/public-pages/AlumniRegister';
import { VerifyAccount } from '../pages/public-pages/VerifyAccount';
import { AuthCallback } from '../pages/public-pages/AuthCallback';
import { Login } from '../pages/public-pages/Login';
import { SchoolAdminRequest } from '../pages/public-pages/SchoolAdminRequest';
import { AdminSetupPassword } from '../pages/public-pages/AdminSetupPassword';
import { DeveloperLogin } from '../pages/developer/DeveloperLogin';
import { NotFound } from '../pages/common-pages/NotFound';

// Lazy-Loaded Layouts & Secondary Pages (On-Demand Code Splitting)
const AlumniLayout = lazy(() => import('../layouts/AlumniLayout').then(m => ({ default: m.AlumniLayout })));
const SchoolAdminLayout = lazy(() => import('../layouts/SchoolAdminLayout').then(m => ({ default: m.SchoolAdminLayout })));
const DeveloperLayout = lazy(() => import('../layouts/DeveloperLayout').then(m => ({ default: m.DeveloperLayout })));

// Alumni Pages (Lazy)
const AlumniDashboard = lazy(() => import('../pages/alumni/AlumniDashboard').then(m => ({ default: m.AlumniDashboard })));
const AlumniProfilePage = lazy(() => import('../pages/alumni/AlumniProfilePage').then(m => ({ default: m.AlumniProfilePage })));
const AlumniBatchesPage = lazy(() => import('../pages/alumni/AlumniBatchesPage').then(m => ({ default: m.AlumniBatchesPage })));
const AlumniDirectoryPage = lazy(() => import('../pages/alumni/AlumniDirectoryPage').then(m => ({ default: m.AlumniDirectoryPage })));
const AlumniSchoolEventsPage = lazy(() => import('../pages/alumni/AlumniSchoolEventsPage').then(m => ({ default: m.AlumniSchoolEventsPage })));
const AlumniEventsPage = lazy(() => import('../pages/alumni/AlumniEventsPage').then(m => ({ default: m.AlumniEventsPage })));
const AlumniAnnouncementsPage = lazy(() => import('../pages/alumni/AlumniAnnouncementsPage').then(m => ({ default: m.AlumniAnnouncementsPage })));
const AlumniGalleryPage = lazy(() => import('../pages/alumni/AlumniGalleryPage').then(m => ({ default: m.AlumniGalleryPage })));
const AlumniDocumentsPage = lazy(() => import('../pages/alumni/AlumniDocumentsPage').then(m => ({ default: m.AlumniDocumentsPage })));
const AlumniNotificationsPage = lazy(() => import('../pages/alumni/AlumniNotificationsPage').then(m => ({ default: m.AlumniNotificationsPage })));
const AlumniSettingsPage = lazy(() => import('../pages/alumni/AlumniSettingsPage').then(m => ({ default: m.AlumniSettingsPage })));
const AlumniFeedback = lazy(() => import('../pages/alumni/AlumniFeedback').then(m => ({ default: m.AlumniFeedback })));
const AlumniDataReportsModule = lazy(() => import('../pages/common-pages/AlumniDataReportsModule').then(m => ({ default: m.AlumniDataReportsModule })));
const AlumniSupportSchool = lazy(() => import('../pages/alumni/AlumniSupportSchool').then(m => ({ default: m.AlumniSupportSchool })));
const AlumniContribute = lazy(() => import('../pages/alumni/AlumniContribute').then(m => ({ default: m.AlumniContribute })));
const AlumniMyContributions = lazy(() => import('../pages/alumni/AlumniMyContributions').then(m => ({ default: m.AlumniMyContributions })));
// School Admin Pages (Lazy)
const Dashboard = lazy(() => import('../pages/school-admin/Dashboard').then(m => ({ default: m.Dashboard })));
const VerificationQueue = lazy(() => import('../pages/school-admin/VerificationQueue').then(m => ({ default: m.VerificationQueue })));
const AlumniManagement = lazy(() => import('../pages/school-admin/AlumniManagement').then(m => ({ default: m.AlumniManagement })));
const Batches = lazy(() => import('../pages/school-admin/Batches').then(m => ({ default: m.Batches })));
const BatchDetails = lazy(() => import('../pages/school-admin/BatchDetails').then(m => ({ default: m.BatchDetails })));
const EventsList = lazy(() => import('../pages/school-admin/EventsList').then(m => ({ default: m.EventsList })));
const CreateEditEvent = lazy(() => import('../pages/school-admin/CreateEditEvent').then(m => ({ default: m.CreateEditEvent })));
const EventDetails = lazy(() => import('../pages/school-admin/EventDetails').then(m => ({ default: m.EventDetails })));
const AttendanceRoster = lazy(() => import('../pages/school-admin/AttendanceRoster').then(m => ({ default: m.AttendanceRoster })));
const AnnouncementsManager = lazy(() => import('../pages/school-admin/AnnouncementsManager').then(m => ({ default: m.AnnouncementsManager })));
const MemoriesModeration = lazy(() => import('../pages/school-admin/MemoriesModeration').then(m => ({ default: m.MemoriesModeration })));
const FeedbackManagement = lazy(() => import('../pages/school-admin/FeedbackManagement').then(m => ({ default: m.FeedbackManagement })));
const ReportsDashboard = lazy(() => import('../pages/school-admin/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })));
const SchoolSettings = lazy(() => import('../pages/school-admin/SchoolSettings').then(m => ({ default: m.SchoolSettings })));
const AssociationTeam = lazy(() => import('../pages/school-admin/AssociationTeam').then(m => ({ default: m.AssociationTeam })));
const RankHoldersManager = lazy(() => import('../pages/school-admin/RankHoldersManager').then(m => ({ default: m.RankHoldersManager })));
const SchoolEventsManager = lazy(() => import('../pages/school-admin/SchoolEventsManager').then(m => ({ default: m.SchoolEventsManager })));
const AuditManager = lazy(() => import('../pages/school-admin/AuditManager').then(m => ({ default: m.AuditManager })));
const ContributionManager = lazy(() => import('../pages/school-admin/ContributionManager').then(m => ({ default: m.ContributionManager })));
const SponsorManager = lazy(() => import('../pages/school-admin/SponsorManager').then(m => ({ default: m.SponsorManager })));
// Programmes Management Module Pages (Lazy)
const PublicProgrammesPage = lazy(() => import('../pages/public-pages/PublicProgrammesPage').then(m => ({ default: m.PublicProgrammesPage })));
const PublicProgrammeDetailPage = lazy(() => import('../pages/public-pages/PublicProgrammeDetailPage').then(m => ({ default: m.PublicProgrammeDetailPage })));
const ProgrammeInviteLanding = lazy(() => import('../pages/public-pages/ProgrammeInviteLanding').then(m => ({ default: m.ProgrammeInviteLanding })));

const AlumniProgrammesPage = lazy(() => import('../pages/alumni/AlumniProgrammesPage').then(m => ({ default: m.AlumniProgrammesPage })));
const AlumniProgrammeDetail = lazy(() => import('../pages/alumni/AlumniProgrammeDetail').then(m => ({ default: m.AlumniProgrammeDetail })));
const AlumniMyProgrammesPage = lazy(() => import('../pages/alumni/AlumniMyProgrammesPage').then(m => ({ default: m.AlumniMyProgrammesPage })));

const ProgrammesList = lazy(() => import('../pages/school-admin/ProgrammesList').then(m => ({ default: m.ProgrammesList })));
const CreateEditProgramme = lazy(() => import('../pages/school-admin/CreateEditProgramme').then(m => ({ default: m.CreateEditProgramme })));
const ProgrammeRegistrations = lazy(() => import('../pages/school-admin/ProgrammeRegistrations').then(m => ({ default: m.ProgrammeRegistrations })));

// Developer Pages (Lazy)
const DeveloperPortal = lazy(() => import('../pages/developer/DeveloperPortal').then(m => ({ default: m.DeveloperPortal })));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>

      {/* 1. PUBLIC ROUTES */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<PublicAbout />} />
        <Route path="school" element={<PublicSchool />} />
        <Route path="batches" element={<PublicBatches />} />
        <Route path="events" element={<PublicEvents />} />
        <Route path="memories" element={<PublicMemories />} />
        <Route path="news/:id" element={<NewsDetailPage />} />
        <Route path="announcements/:id" element={<NewsDetailPage />} />
        <Route path="meeting-minutes/:id" element={<MeetingMinuteDetailPage />} />
        <Route path="audit" element={<AuditListPage />} />
        <Route path="audit/:id" element={<AuditDetailPage />} />
        <Route path="audit/meeting-minutes/:id" element={<MeetingMinuteDetailPage />} />
        <Route path="programmes" element={<PublicProgrammesPage />} />
        <Route path="programmes/:slug" element={<PublicProgrammeDetailPage />} />
        <Route path="programme-invite/:token" element={<ProgrammeInviteLanding />} />
        <Route path="contributors" element={<PublicContributorsPage />} />
        <Route path="sponsors" element={<PublicSponsorsPage />} />
        <Route path="contact" element={<PublicContact />} />
        <Route path="feedback" element={<PublicFeedback />} />
        <Route path="karuthukal" element={<PublicFeedback />} />
        <Route path="terms" element={<PublicTerms />} />
        <Route path="terms-and-conditions" element={<PublicTerms />} />
        <Route path="privacy" element={<PublicPrivacy />} />
        <Route path="privacy-policy" element={<PublicPrivacy />} />
        <Route path="login" element={<AlumniLogin />} />
        <Route path="register" element={<AlumniRegister />} />
        <Route path="verify-account" element={<VerifyAccount />} />
        <Route path="auth/callback" element={<AuthCallback />} />
      </Route>

      {/* Admin & Developer Logins & Access Requests */}
      <Route path="/admin/login" element={<Login onLoginSuccess={(path) => navigate(path || '/school-admin')} />} />
      <Route path="/admin/request-access" element={<SchoolAdminRequest />} />
      <Route path="/admin/setup-password" element={<AdminSetupPassword />} />
      <Route path="/developer/login" element={<DeveloperLogin onLoginSuccess={(path) => navigate(path || '/developer')} />} />

      {/* 2. ALUMNI STUDENT ROUTES */}
      <Route path="/alumni" element={<AlumniLayout />}>
        <Route index element={<AlumniDashboard />} />
        <Route path="profile" element={<AlumniProfilePage />} />
        <Route path="batch" element={<AlumniBatchesPage />} />
        <Route path="batch/members" element={<AlumniBatchesPage />} />
        <Route path="directory" element={<AlumniDirectoryPage />} />
        <Route path="reports" element={<AlumniDataReportsModule />} />
        <Route path="directory-reports" element={<AlumniDataReportsModule />} />
        <Route path="school-events" element={<AlumniSchoolEventsPage />} />
        <Route path="community" element={<AlumniSchoolEventsPage />} />
        <Route path="mentorship" element={<AlumniSchoolEventsPage />} />
        <Route path="events" element={<AlumniEventsPage />} />
        <Route path="events/:eventId" element={<AlumniEventsPage />} />
        <Route path="announcements" element={<AlumniAnnouncementsPage />} />
        <Route path="gallery" element={<AlumniGalleryPage />} />
        <Route path="memories" element={<AlumniGalleryPage />} />
        <Route path="documents" element={<AlumniDocumentsPage />} />
        <Route path="notifications" element={<AlumniNotificationsPage />} />
        <Route path="feedback" element={<AlumniFeedback />} />
        <Route path="settings" element={<AlumniSettingsPage />} />
        <Route path="support" element={<AlumniSupportSchool />} />
        <Route path="support/contribute" element={<AlumniContribute />} />
        <Route path="support/contributions" element={<AlumniMyContributions />} />
        <Route path="programmes" element={<AlumniProgrammesPage />} />
        <Route path="programmes/:slug" element={<AlumniProgrammeDetail />} />
        <Route path="my-programmes" element={<AlumniMyProgrammesPage />} />
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
        <Route path="events/:eventId/edit" element={<CreateEditEvent />} />
        <Route path="events/:eventId" element={<EventDetails />} />
        <Route path="events/:eventId/attendance" element={<AttendanceRoster />} />
        <Route path="school-events" element={<SchoolEventsManager />} />
        <Route path="programmes" element={<ProgrammesList />} />
        <Route path="programmes/create" element={<CreateEditProgramme />} />
        <Route path="programmes/:id/edit" element={<CreateEditProgramme />} />
        <Route path="programmes/:id/registrations" element={<ProgrammeRegistrations />} />
        <Route path="announcements" element={<AnnouncementsManager />} />
        <Route path="memories" element={<MemoriesModeration />} />
        <Route path="feedback" element={<FeedbackManagement />} />
        <Route path="association-team" element={<AssociationTeam />} />
        <Route path="rank-holders" element={<RankHoldersManager />} />
        <Route path="reports" element={<ReportsDashboard />} />
        <Route path="settings" element={<SchoolSettings />} />
        <Route path="audit" element={<AuditManager />} />
        <Route path="contributions" element={<ContributionManager />} />
        <Route path="sponsors" element={<SponsorManager />} />
      </Route>

      {/* 4. PLATFORM DEVELOPER ROUTES */}
      <Route path="/developer" element={<DeveloperLayout />}>
        <Route index element={<DeveloperPortal />} />
        <Route path="schools" element={<DeveloperPortal />} />
        <Route path="schools/:schoolId" element={<DeveloperPortal />} />
        <Route path="school-admins" element={<DeveloperPortal />} />
        <Route path="users" element={<DeveloperPortal />} />
        <Route path="enquiries" element={<DeveloperPortal />} />
        <Route path="reports" element={<DeveloperPortal />} />
        <Route path="audit-logs" element={<DeveloperPortal />} />
        <Route path="settings" element={<DeveloperPortal />} />
      </Route>

      {/* Default Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
  );
};

