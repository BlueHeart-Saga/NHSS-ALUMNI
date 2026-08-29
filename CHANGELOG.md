# Release Notes & Changelog

## v1.1.0 — Phase 2 Production Readiness & Pilot Release (2026-08-27)

### Added
- **Production Secret Validation**: Automatic startup secret validator in `app/core/config.py` enforcing minimum 32-character custom JWT secret, valid MongoDB URI, and non-wildcard CORS origins when `APP_ENV=production`.
- **Environment Database Fail-Fast**: Enforced strict production database behavior in `app/core/database.py` that fails fast at startup if MongoDB is unreachable, preventing silent fallback to in-memory databases in production.
- **Readiness Probe Endpoint (`GET /ready`)**: Database ping and storage connection probe.
- **Sanitized Global Exception Handler**: Sanitizes 500 internal stack traces from public responses in production environment.
- **Enhanced CSV Import & Duplicate Engine**: Full validation summary (Total, Valid, Duplicates Flagged, Errors) and `/alumni/export-import-errors` CSV download endpoint.
- **Event Capacity Overbooking Protection**: RSVP handler blocks requests exceeding `event.max_capacity` with `409 Conflict`.
- **Image Compression & Thumbnail Generator**: PIL WebP compression and 400px thumbnail generation in `app/services/azure_blob.py` with structured paths (`school_id/event_id/uuid.webp`).
- **Automated Security & Tenant Test Suites**: `test_tenant_isolation.py`, `test_csv_import.py`, `test_event_capacity.py` (11/11 tests passing).
- **Production Operational Documentation**: `phase-2-audit.md`, `production-deployment.md`, `database-backup.md`, `security.md`, `event-day-guide.md`, `pilot-guide.md`, `admin-guide.md`.

### Changed
- CORS headers restricted to configured domains in production environment.
- Upgraded Pydantic CSV import models to include row error details.

---

## v1.0.0 — Phase 1 MVP Developer-Complete (2026-08-27)
- Initial release featuring FastAPI backend, React Admin Web Portal, Mobile Alumni App simulator, MongoDB schemas, OTP Auth, Alumni Verification, Batch Cohorts, Events, RSVP, Cryptographic QR Tickets, Venue Check-in Terminal, Announcements, and Memories.
