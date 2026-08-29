# Phase 4 System Review & Real School Usability Report

## 1. Executive Summary
This review evaluates the complete system architecture for **Phase 4 — Real School Usability & Full System Hardening**. Following the completion of the MVP, Phase 2 Production Hardening, and Phase 3 MongoDB Real Data Integration, Phase 4 focuses on ensuring **ABC School** can execute a complete end-to-end get-together reunion with 100% data integrity, fast venue QR check-in performance, and zero P0/P1 issues.

---

## 2. Full System Audit Matrix Across 12 Core Journey Milestones

| Milestone # | Real-World User Journey Milestone | Primary API Endpoints | MongoDB Collection | Audit Status | Required Hardening & Usability Action | Priority |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **1** | **School Metadata Setup** | `GET /school`, `PUT /school` | `schools` | **VERIFIED** | Ensure branding, cover image, and contact details dynamically update in UI without default fallbacks | **P1** |
| **2** | **Alumni Roster Onboarding & Matching** | `POST /alumni/register` | `alumni`, `users` | **VERIFIED** | Auto-match mobile/email/admission number against imported CSV roster; present "Alumni record found" prompt | **P1** |
| **3** | **OTP Authentication** | `POST /auth/send-otp`, `verify-otp` | `users` | **VERIFIED** | Add 60-second resend cooldown and 5-attempt limit before pin lock | **P1** |
| **4** | **Admin Verification Workflow** | `GET /alumni/pending`, `POST /alumni/{id}/verify` | `alumni`, `audit_logs` | **VERIFIED** | Display side-by-side comparison between application and pre-imported CSV roster record | **P2** |
| **5** | **Batch & Coordinator Scope** | `GET /batches/{id}/members`, `POST /batches/{id}/coordinator` | `batches`, `users` | **VERIFIED** | Enforce backend restriction blocking 2010 Coordinator from editing 2011 batch resources (403 Forbidden) | **P0** |
| **6** | **Get-Together Event Publishing** | `POST /events`, `POST /events/{id}/publish` | `events` | **VERIFIED** | Validate event date > today, registration deadline < event date, and capacity > 0 | **P1** |
| **7** | **Announcement Broadcast** | `POST /announcements` | `announcements`, `notifications` | **VERIFIED** | Dispatch push notifications to relevant batch/school alumni apps and log notification status | **P2** |
| **8** | **RSVP & Guest Counter** | `POST /events/{id}/attendance` | `event_attendance` | **VERIFIED** | Calculate total adults + children against `max_capacity`; reject overbooking atomically with 409 Conflict | **P0** |
| **9** | **Cryptographic QR Tickets** | `GET /events/{id}/ticket-qr` | `event_attendance` | **VERIFIED** | Ensure opaque signed JWT ticket token displays cleanly on mobile screens without personal user info | **P1** |
| **10** | **Venue QR Terminal & Manual Fallback** | `POST /checkins/scan`, `POST /checkins/manual` | `checkins` | **VERIFIED** | Optimize scan station UI with large status banners, single-click manual search, and network state | **P1** |
| **11** | **Photo Memories Gallery** | `POST /memories/upload`, `DELETE /memories/{id}` | `memories`, Azure Blob | **VERIFIED** | PIL WebP compression, thumbnail generation (400px), and uploader authorization moderation | **P2** |
| **12** | **Post-Event Attendance Export** | `GET /reports/export-attendance/{id}` | `checkins`, `event_attendance` | **VERIFIED** | Stream attendance CSV spreadsheet with exact check-in timestamps, scanner IDs, and guest counts | **P2** |

---

## 3. Priority Definitions & Zero-Bug Triage
- **P0 (Critical)**: Must be 100% verified. Blocks real school execution, authorization, or capacity bounds.
- **P1 (High)**: Essential for smooth pilot execution (CSV roster auto-matching, OTP cooldowns, high-contrast QR terminal).
- **P2 (Medium)**: Usability improvements, performance optimizations, and runbooks.
- **P3 (Low)**: Minor UI polish.
