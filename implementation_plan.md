# Implementation Plan: School Alumni Platform ("JustGatherNow")

Build a production-ready, SaaS-architected School Alumni Management and Batch Get-Together Platform for initial deployment with **ABC School**. The platform includes a Python FastAPI backend, a React + Vite + Tailwind Admin Web Portal, a React Native / Mobile Alumni Application, and MongoDB data models with strict tenant isolation (`school_id`).

## Architecture & Design Highlights
- **Tenant Isolation**: Every MongoDB document includes `school_id` derived automatically from authenticated JWT tokens to guarantee B2B SaaS data isolation.
- **Design System**: Premium, clean white canvas (`#FFFFFF`), high-contrast dark typography (`#111111`), subtle soft yellow accents (`#F4C542`, `#FFF7D6`), 14-18px rounded borders (`#E5E7EB`), large whitespace, no cluttered card grids or unnecessary gradients.
- **Roles**: `SCHOOL_ADMIN`, `BATCH_COORDINATOR`, `ALUMNI`.
- **Target Initial Capacity**: Configured & seeded for ABC School with 500 alumni, cohorts 2005–2025, and reunion event workflows.

---

## User Review Required

> [!IMPORTANT]
> **Monorepo Directory Layout**: The system will be built within `c:\sagadevan\Projects\justgathernow` under a clean monorepo architecture:
> - `backend/`: Python FastAPI, Motor MongoDB, Pydantic schemas, Auth/Tenant middleware, Azure Blob storage handler, Seed scripts, Pytest.
> - `admin-web/`: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query, React Router v6.
> - `mobile-app/`: React Native / Expo app structure + responsive Web-Mobile preview layout so you can test all 19 mobile alumni screens directly in browser alongside the web admin portal.
> - `docs/`: Technical specification files (Architecture, Schemas, API, Permissions, Design System, Azure setup).

> [!NOTE]
> **Authentication & Local Dev**: Auth defaults to OTP simulation (Enter any mobile number, default dev OTP is `123456` or generated in terminal logs) for immediate seamless testing without needing paid SMS gateways during development.

---

## Proposed Changes

### 1. Repository Structure & Configuration

#### [NEW] [README.md](file:///c:/sagadevan/Projects/justgathernow/README.md)
Comprehensive quickstart guide for running backend, database, admin portal, mobile app, running test suites, and deploying to Azure.

#### [NEW] [package.json](file:///c:/sagadevan/Projects/justgathernow/package.json)
Workspace configuration to easily run admin web, mobile web simulator, and backend with simple scripts.

---

### 2. Backend Service (`backend/`)

#### [NEW] [backend/requirements.txt](file:///c:/sagadevan/Projects/justgathernow/backend/requirements.txt)
Dependencies: `fastapi`, `uvicorn`, `motor`, `pydantic`, `pydantic-settings`, `pyjwt`, `passlib[bcrypt]`, `azure-storage-blob`, `python-multipart`, `pytest`, `httpx`.

#### [NEW] [backend/app/main.py](file:///c:/sagadevan/Projects/justgathernow/backend/app/main.py)
FastAPI application entry point, CORS middleware, exception handlers, API v1 router registration.

#### [NEW] [backend/app/core/config.py](file:///c:/sagadevan/Projects/justgathernow/backend/app/core/config.py)
Environment variables management (Pydantic BaseSettings for MongoDB URI, JWT secret, Azure Blob Storage string, etc.).

#### [NEW] [backend/app/core/database.py](file:///c:/sagadevan/Projects/justgathernow/backend/app/core/database.py)
Motor async MongoDB client setup & collection indexes initialization.

#### [NEW] [backend/app/core/security.py](file:///c:/sagadevan/Projects/justgathernow/backend/app/core/security.py)
JWT token creation, validation, OTP generator, password hashing.

#### [NEW] [backend/app/middleware/auth.py](file:///c:/sagadevan/Projects/justgathernow/backend/app/middleware/auth.py)
Authentication token extractor & tenant scope validation middleware (`school_id`).

#### [NEW] [backend/app/schemas/](file:///c:/sagadevan/Projects/justgathernow/backend/app/schemas)
Pydantic v2 schemas for Auth, School, Alumni, Batches, Events, Attendance, QR Checkin, Announcements, Memories, Audit logs.

#### [NEW] [backend/app/api/](file:///c:/sagadevan/Projects/justgathernow/backend/app/api)
- `auth.py`: Login, OTP verification, Alumni registration, `/me`.
- `school.py`: School profile read/update.
- `batches.py`: Batches list, create, member list, assign coordinator.
- `alumni.py`: Alumni directory, pending applications queue, verify/reject/suspend, CSV bulk import.
- `events.py`: Create, edit, list, publish, cancel events.
- `attendance.py`: RSVP (Attending/Maybe/Declined, adults/children count), my QR ticket details, attendance dashboard.
- `checkins.py`: Secure QR scan check-in & manual check-in API.
- `announcements.py`: School & Batch announcements.
- `memories.py`: Photo upload (Azure Blob Storage), list gallery, moderate photos.
- `reports.py`: Dashboard stats, alumni CSV export, attendance CSV export.

#### [NEW] [backend/app/seed.py](file:///c:/sagadevan/Projects/justgathernow/backend/app/seed.py)
Automated database seeder for ABC School:
- Initial school: ABC School
- Cohorts: 2005 - 2025
- Users & Alumni: 500 sample alumni (380 verified, 40 pending, coordinators, admins)
- Events: "2010 Silver Jubilee Reunion" (Published, venue details, capacity 300)
- RSVPs & QR tokens: 180 confirmed alumni with guest counts
- Check-ins: Live checked-in records
- Announcements & Memories: Sample photos & announcements.

#### [NEW] [backend/tests/](file:///c:/sagadevan/Projects/justgathernow/backend/tests)
Automated Pytest suite testing authentication, authorization, multi-tenant isolation, QR check-in validation, and duplicate scan rejection.

---

### 3. Admin Web App (`admin-web/`)

#### [NEW] [admin-web/package.json](file:///c:/sagadevan/Projects/justgathernow/admin-web/package.json) & [admin-web/vite.config.ts](file:///c:/sagadevan/Projects/justgathernow/admin-web/vite.config.ts)
React 18 + Vite + TypeScript setup.

#### [NEW] [admin-web/src/index.css](file:///c:/sagadevan/Projects/justgathernow/admin-web/src/index.css)
Tailwind CSS configuration & custom token utility classes (#FFFFFF, #111111, #F4C542, #FFF7D6).

#### [NEW] [admin-web/src/components/](file:///c:/sagadevan/Projects/justgathernow/admin-web/src/components)
Reusable UI components: Sidebar, TopBar, StatsCard, Badge, Button, Input, Modal, Drawer, Table, Pagination, EmptyState, LoadingState, ConfirmDialog, QRScannerModal.

#### [NEW] [admin-web/src/pages/](file:///c:/sagadevan/Projects/justgathernow/admin-web/src/pages)
16 Admin screens: Login, Dashboard, Alumni Management, Verification Queue, Batches, Batch Details, Events List, Create/Edit Event, Event Details & RSVP Roster, QR Check-in Terminal, Announcements Manager, Memories Moderation, Reports & CSV Export, School Settings.

---

### 4. Mobile Alumni Application (`mobile-app/`)

#### [NEW] [mobile-app/package.json](file:///c:/sagadevan/Projects/justgathernow/mobile-app/package.json)
React Native + Expo setup with cross-platform web simulator support.

#### [NEW] [mobile-app/src/screens/](file:///c:/sagadevan/Projects/justgathernow/mobile-app/src/screens)
19 Mobile screens:
1. Splash
2. Welcome
3. Login (Mobile No.)
4. OTP Pin Verification
5. Registration Form
6. Verification Pending Screen
7. Home Dashboard (Hero Event Card, Announcement Card, Batch Summary, Photo Memories)
8. Batch Overview
9. Batch Members Directory
10. Member Profile Detail
11. Events Feed
12. Event Details & Map Location
13. RSVP & Guest Count Modal (Adults/Kids)
14. Secure Event QR Ticket
15. Announcements Feed
16. Event Photo Gallery
17. Photo Upload Screen
18. Self Profile
19. Settings & Privacy Toggles

---

## Verification Plan

### Automated Tests
1. **Backend Unit & Authorization Tests**:
   - `pytest backend/tests/test_auth.py`: Verify OTP generation, JWT issuance, `/me` endpoint.
   - `pytest backend/tests/test_authorization.py`: Test that a 2010 Batch Coordinator cannot edit a 2011 Batch Event.
   - `pytest backend/tests/test_checkin.py`: Test QR code validation, expired token rejection, duplicate check-in blocking.
   - `pytest backend/tests/test_alumni.py`: Test verification workflow (PENDING -> APPROVED / REJECTED / SUSPENDED).

### Manual & Real-World User Journey Test
Perform the complete 27-step user journey test on ABC School sample data:
1. Open Mobile App -> Enter mobile number `+919876543210` -> Input OTP `123456`.
2. Register new alumnus profile (Name: Arun Kumar, Passing Year: 2010).
3. Confirm status is `PENDING` ("Your alumni profile is currently being verified").
4. Open Admin Web -> View Verification Queue -> Approve Arun Kumar.
5. Mobile App updates to `APPROVED` -> Access Alumni Home Dashboard.
6. Browse Batch 2010 directory & view batchmate profiles.
7. Open 2010 Silver Jubilee Reunion Event -> Click "I'M ATTENDING" -> Select 2 Adults, 1 Child.
8. View generated Secure Event QR Ticket on Mobile.
9. Open Admin QR Check-in Scanner -> Scan or enter QR token -> Receive instant green "CHECK-IN SUCCESSFUL" response.
10. Confirm Attendance Dashboard counters increment in real-time.
11. Upload reunion memory photo from Mobile -> View in Photo Gallery.
12. Export final attendance CSV report from Admin Web.
