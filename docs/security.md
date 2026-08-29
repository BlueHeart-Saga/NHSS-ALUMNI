# Security Specification & Test Verification Matrix

## 1. Security & Data Minimization Principles
- **Strict Data Isolation**: Multi-tenant data structures (`school_id`) prevent cross-tenant data leakage. Clients never supply `school_id` directly for query scoping; backend handlers extract `school_id` from cryptographically verified JWT payloads.
- **Data Minimization**: Public alumni profiles hide phone numbers and email addresses by default (`email_visible = false`) unless explicitly made visible by the alumnus or viewed by a authorized `SCHOOL_ADMIN`.
- **Credential Protection**: Passwords, OTPs, JWT keys, and private notification keys are never logged in application stdout or audit trails.

---

## 2. Granular Security Test Matrix

| Test ID | Test Description | Target Role / State | Input / Action | Expected Result | Automated Test File |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Unauthenticated Access | Anonymous | Request protected API `/alumni/directory` without Bearer token | `401 Unauthorized` | `test_tenant_isolation.py` |
| **SEC-02** | Role Privilege Escalation | `ALUMNI` | Attempt to call `/alumni/{id}/verify` or `/batches` POST | `403 Forbidden` | `test_tenant_isolation.py` |
| **SEC-03** | Unverified Alumni Access | `ALUMNI (PENDING)` | Attempt to submit RSVP or view ticket QR | `403 Forbidden` | `test_tenant_isolation.py` |
| **SEC-04** | Cross-Batch Modification | `BATCH_COORDINATOR` | Attempt to edit event for unassigned batch | `403 Forbidden` | `test_tenant_isolation.py` |
| **SEC-05** | Event Overbooking | `ALUMNI (APPROVED)` | RSVP when requested seats exceed `max_capacity` | `409 Conflict` | `test_event_capacity.py` |
| **SEC-06** | Invalid QR Ticket | `BATCH_COORDINATOR` | Scan forged or expired QR token | `400 Bad Request` | `test_auth.py` |
| **SEC-07** | Duplicate QR Check-in | `BATCH_COORDINATOR` | Scan same valid ticket QR twice | `400 Bad Request` ("ALREADY CHECKED IN") | `test_checkin.py` |
| **SEC-08** | Production Fail-Fast | Environment | Start app with default JWT secret in production | Startup Exception (`RuntimeError`) | `test_tenant_isolation.py` |

---

## 3. Rate Limiting & Abuse Prevention
- **OTP Request Rate Limit**: Max 3 requests per mobile number per hour.
- **OTP Verification Retry Limit**: Max 5 incorrect attempts before locking OTP pin.
- **File Upload Limits**: Max 10MB per upload, restricted to valid image MIME types (`image/jpeg`, `image/png`, `image/webp`).
