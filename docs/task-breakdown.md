# Development Task Breakdown (Phases 1 - 12)

## Phase 1: Foundation & Project Setup
- [ ] Initialize repository structure (`backend/`, `admin-web/`, `mobile-app/`, `docs/`, `scripts/`).
- [ ] Set up FastAPI backend with Pydantic v2, Motor MongoDB driver, CORS, logging, and health check routes.
- [ ] Set up React Admin web app with Vite, TypeScript, Tailwind CSS, Lucide icons, and React Router.
- [ ] Set up Mobile Alumni UI (React web mobile frame & Expo React Native components).
- [ ] Set up design system tokens (#FFFFFF canvas, #111111 dark typography, #F4C542 primary yellow accent, #FFF7D6 soft yellow).

## Phase 2: Authentication & Authorization Engine
- [ ] Mobile number + 6-digit OTP endpoint with expiry & rate-limiting logic.
- [ ] JWT authentication (access & refresh tokens) with role middleware (`SCHOOL_ADMIN`, `BATCH_COORDINATOR`, `ALUMNI`).
- [ ] Tenant context extraction middleware (`school_id` isolation).
- [ ] OTP auth UI screens (Mobile Login, OTP verify pin).

## Phase 3: School Profile & Batch Management
- [ ] Seed script for ABC School & default batches (2005 - 2025).
- [ ] School profile API & settings page in Admin web.
- [ ] Batch cohort API (Create, list, assign coordinators).
- [ ] Batch management UI in Admin web & Mobile app.

## Phase 4: Alumni Registration & Verification Module
- [ ] Alumni registration API endpoint (`PENDING` status).
- [ ] CSV import API for bulk alumni verification against school records.
- [ ] Admin verification queue UI with Approve, Reject, and Suspend controls.
- [ ] Alumni profile API & directory search with privacy settings (`email_visible`).

## Phase 5: Events & Get-Together Module
- [ ] Event CRUD endpoints with status workflow (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`).
- [ ] Target scoping (School-wide reunion vs Batch-specific reunion).
- [ ] Create / Edit Event form in Admin web and Coordinator mobile view.
- [ ] Event Details view with venue address, schedule, and attendee counters.

## Phase 6: Attendance & RSVP Dashboard
- [ ] RSVP API endpoint (`ATTENDING`, `MAYBE`, `DECLINED`) with adult & child guest counters.
- [ ] RSVP deadline enforcement logic.
- [ ] Real-time Attendance Analytics Dashboard in Admin web.

## Phase 7: Secure QR Check-In Engine
- [ ] Cryptographic QR token generator per attendee per event.
- [ ] Admin / Coordinator QR Scanner screen with live webcam validation.
- [ ] Duplicate check-in prevention & manual attendee search fallback.

## Phase 8: Announcements & Push Notifications
- [ ] School-wide & Batch announcement creation & feed API.
- [ ] Announcement cards in Admin web & Mobile app.
- [ ] Mock FCM push notification dispatcher log.

## Phase 9: Memories & Azure Blob Storage Integration
- [ ] Memory photo upload API with file validation, MIME check, and Azure Blob storage / local mock upload.
- [ ] Photo gallery grid UI in Mobile app & Admin web.
- [ ] Photo moderation & hide/delete controls for admins.

## Phase 10: Reports & CSV Data Export
- [ ] Aggregate statistics API (Total alumni, turnout rates, RSVP vs checked-in counts).
- [ ] Alumni roster CSV exporter & Event attendance CSV exporter.
- [ ] Admin Reports dashboard.

## Phase 11: End-to-End Testing & Security Audit
- [ ] Unit tests for FastAPI routes & authorization middleware.
- [ ] Data isolation tests (Batch A coordinator cannot modify Batch B event).
- [ ] Full 27-step real-world user journey validation.

## Phase 12: Production Readiness & Release
- [ ] Environment variable validation & setup guides.
- [ ] README.md documentation.
- [ ] Production deployment scripts.
