# Frontend Architecture & Screen-to-API Mapping

## 1. System Overview
JustGatherNow uses a centralized REST API service layer powered by FastAPI and MongoDB. The system comprises two frontends:
- **Admin Web Application**: Built with React 18, Vite, TypeScript, Tailwind CSS, and Lucide Icons (16 Screen Views).
- **Alumni Mobile Application**: Built with React Native / Expo + Web simulator container (19 Screen Views).

Both frontends use strict TypeScript interfaces, central API service instances, and zero mock business data in production paths.

---

## 2. Admin Web Navigation & Module Mapping (16 Modules)

| # | Screen / Module | Primary UI Component | REST API Endpoint | HTTP Method | MongoDB Collection | Permission |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **1** | Dashboard | `Dashboard.tsx` | `/api/v1/reports/summary` | `GET` | Aggregation (`alumni`, `batches`, `events`) | `SCHOOL_ADMIN` |
| **2** | Verification Queue | `VerificationQueue.tsx` | `/api/v1/alumni/pending`<br>`/api/v1/alumni/{id}/verify` | `GET`<br>`POST` | `alumni`, `audit_logs` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **3** | Alumni Directory | `AlumniManagement.tsx` | `/api/v1/alumni/directory` | `GET` | `alumni` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **4** | Alumni CSV Import | `AlumniManagement.tsx` | `/api/v1/alumni/import-csv` | `POST` | `alumni`, `audit_logs` | `SCHOOL_ADMIN` |
| **5** | Batches Cohorts | `BatchesManagement.tsx` | `/api/v1/batches`<br>`/api/v1/batches` | `GET`<br>`POST` | `batches` | `SCHOOL_ADMIN` |
| **6** | Batch Detail & Roster | `BatchDetails.tsx` | `/api/v1/batches/{id}/members`<br>`/api/v1/batches/{id}/coordinators` | `GET`<br>`POST` | `batches`, `alumni`, `users` | `SCHOOL_ADMIN` |
| **7** | Events List | `EventsList.tsx` | `/api/v1/events` | `GET` | `events`, `event_attendance` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **8** | Create Event | `CreateEvent.tsx` | `/api/v1/events` | `POST` | `events`, `audit_logs` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **9** | Event Details | `EventDetails.tsx` | `/api/v1/events/{id}`<br>`/api/v1/events/{id}/publish` | `GET`<br>`POST` | `events` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **10** | Attendance Roster | `AttendanceRoster.tsx` | `/api/v1/attendance/{id}/roster`<br>`/api/v1/attendance/{id}/dashboard` | `GET`<br>`GET` | `event_attendance`, `alumni` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **11** | QR Check-in Terminal | `QRCheckinTerminal.tsx` | `/api/v1/checkins/scan`<br>`/api/v1/checkins/manual` | `POST`<br>`POST` | `checkins`, `event_attendance` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **12** | Announcements Manager | `AnnouncementsManager.tsx` | `/api/v1/announcements`<br>`/api/v1/announcements` | `GET`<br>`POST` | `announcements`, `notifications` | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` |
| **13** | Memories Moderation | `MemoriesModeration.tsx` | `/api/v1/memories`<br>`/api/v1/memories/{id}` | `GET`<br>`DELETE` | `memories`, Azure Storage | `SCHOOL_ADMIN` |
| **14** | Reports Dashboard | `ReportsDashboard.tsx` | `/api/v1/reports/summary`<br>`/api/v1/reports/export-alumni` | `GET`<br>`GET` | MongoDB cursor streams | `SCHOOL_ADMIN` |
| **15** | School Settings | `SchoolSettings.tsx` | `/api/v1/school/profile`<br>`/api/v1/school/profile` | `GET`<br>`PUT` | `schools` | `SCHOOL_ADMIN` |
| **16** | Login Portal | `Login.tsx` | `/api/v1/auth/send-otp`<br>`/api/v1/auth/verify-otp` | `POST`<br>`POST` | `users` | `PUBLIC` |

---

## 3. Alumni Mobile Application Navigation & Module Mapping (19 Screens)

| # | Screen View | State Enum | REST API Endpoint | HTTP Method | MongoDB Collection | Permission |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **1** | Splash Screen | `SPLASH` | `/api/v1/auth/me` | `GET` | `users`, `alumni` | `PUBLIC` |
| **2** | Welcome Screen | `WELCOME` | `/api/v1/school/profile` | `GET` | `schools` | `PUBLIC` |
| **3** | Login Screen | `LOGIN` | `/api/v1/auth/send-otp` | `POST` | `users` | `PUBLIC` |
| **4** | OTP Screen | `OTP` | `/api/v1/auth/verify-otp` | `POST` | `users` | `PUBLIC` |
| **5** | Alumni Registration | `REGISTER` | `/api/v1/auth/register` | `POST` | `alumni`, `users` | `AUTHENTICATED` |
| **6** | Verification Status | `PENDING` | `/api/v1/auth/me` | `GET` | `alumni` | `AUTHENTICATED` |
| **7** | Mobile Home | `HOME` | `/api/v1/events`<br>`/api/v1/announcements` | `GET`<br>`GET` | `events`, `announcements` | `VERIFIED_ALUMNI` |
| **8** | Batch Home | `BATCH` | `/api/v1/batches/{id}/members` | `GET` | `batches`, `alumni` | `VERIFIED_ALUMNI` |
| **9** | Batch Members List | `BATCH` | `/api/v1/alumni/directory` | `GET` | `alumni` | `VERIFIED_ALUMNI` |
| **10** | Member Profile | `Member Profile` | `/api/v1/alumni/{id}` | `GET` | `alumni` | `VERIFIED_ALUMNI` |
| **11** | Events Feed | `EVENTS` | `/api/v1/events` | `GET` | `events` | `VERIFIED_ALUMNI` |
| **12** | Event Details | `Event Details` | `/api/v1/events/{id}` | `GET` | `events` | `VERIFIED_ALUMNI` |
| **13** | RSVP Modal | `RSVP Modal` | `/api/v1/attendance/{id}` | `POST` | `event_attendance` | `VERIFIED_ALUMNI` |
| **14** | QR Ticket Modal | `QR Ticket` | `/api/v1/attendance/{id}/ticket-qr` | `GET` | `event_attendance` | `VERIFIED_ALUMNI` |
| **15** | Announcements Feed | `Announcements` | `/api/v1/announcements` | `GET` | `announcements` | `VERIFIED_ALUMNI` |
| **16** | Notifications Feed | `Notifications` | `/api/v1/notifications` | `GET` | `notifications` | `VERIFIED_ALUMNI` |
| **17** | Memories Gallery | `MEMORIES` | `/api/v1/memories` | `GET` | `memories` | `VERIFIED_ALUMNI` |
| **18** | Photo Upload Modal | `Upload Memory` | `/api/v1/memories/upload` | `POST` | `memories`, Azure Storage | `VERIFIED_ALUMNI` |
| **19** | Self Profile & Privacy | `PROFILE` | `/api/v1/auth/me` | `GET` | `alumni` | `VERIFIED_ALUMNI` |
