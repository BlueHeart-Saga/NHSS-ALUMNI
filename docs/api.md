# API Specifications

## 1. Overview & Base URL
All API routes are hosted under `/api/v1`. Authentication tokens are passed in HTTP headers as `Authorization: Bearer <jwt_token>`.

---

## 2. API Endpoint Groups

### 2.1 Authentication & Registration (`/api/v1/auth`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/send-otp` | Public | All | Send 6-digit OTP to mobile number |
| `POST` | `/api/v1/auth/verify-otp` | Public | All | Verify OTP and return JWT access/refresh tokens or flags registration needed |
| `POST` | `/api/v1/auth/register` | Public | All | Register alumni profile (sets status to PENDING) |
| `GET` | `/api/v1/auth/me` | Bearer | All | Get current authenticated user profile & permissions |
| `POST` | `/api/v1/auth/refresh` | Bearer | All | Refresh access token |

### 2.2 School & Batches (`/api/v1/school`, `/api/v1/batches`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/school/profile` | Bearer | All | Get primary school profile & metadata |
| `PUT` | `/api/v1/school/profile` | Bearer | `SCHOOL_ADMIN` | Update school details |
| `GET` | `/api/v1/batches` | Bearer | All | List all active cohorts/batches |
| `POST` | `/api/v1/batches` | Bearer | `SCHOOL_ADMIN` | Create new batch cohort |
| `GET` | `/api/v1/batches/{batch_id}` | Bearer | All | Get batch details, coordinators & stats |
| `GET` | `/api/v1/batches/{batch_id}/members` | Bearer | All | List verified members in batch |
| `POST` | `/api/v1/batches/{batch_id}/coordinators` | Bearer | `SCHOOL_ADMIN` | Assign batch coordinator |

### 2.3 Alumni Management & Verification (`/api/v1/alumni`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/alumni/pending` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | List pending alumni applications |
| `POST` | `/api/v1/alumni/{alumni_id}/verify` | Bearer | `SCHOOL_ADMIN` | Approve or Reject registration |
| `POST` | `/api/v1/alumni/{alumni_id}/suspend` | Bearer | `SCHOOL_ADMIN` | Suspend active alumni |
| `POST` | `/api/v1/alumni/import-csv` | Bearer | `SCHOOL_ADMIN` | Bulk import school roster via CSV |
| `GET` | `/api/v1/alumni/directory` | Bearer | All | Search verified alumni directory |
| `GET` | `/api/v1/alumni/{alumni_id}` | Bearer | All | Get specific alumni public profile |
| `PUT` | `/api/v1/alumni/profile` | Bearer | All | Update self profile |

### 2.4 Events & Get-Togethers (`/api/v1/events`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | Bearer | All | List events (school & batch filtered) |
| `POST` | `/api/v1/events` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Create new event (Draft/Published) |
| `GET` | `/api/v1/events/{event_id}` | Bearer | All | Get event details, schedule & stats |
| `PUT` | `/api/v1/events/{event_id}` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Update event details |
| `POST` | `/api/v1/events/{event_id}/publish` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Publish draft event |
| `POST` | `/api/v1/events/{event_id}/cancel` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Cancel published event |

### 2.5 Attendance & RSVP (`/api/v1/attendance`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/attendance/{event_id}/rsvp` | Bearer | Verified Alumni | Submit or update RSVP (ATTENDING/MAYBE/DECLINED, adults & kids count) |
| `GET` | `/api/v1/attendance/{event_id}/my-ticket` | Bearer | Verified Alumni | Get user event QR code token & RSVP summary |
| `GET` | `/api/v1/attendance/{event_id}/dashboard` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Get detailed attendance counts & RSVP roster |

### 2.6 QR Check-in (`/api/v1/checkins`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/checkins/scan` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Scan & validate QR token for check-in |
| `POST` | `/api/v1/checkins/manual` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Manual check-in by search |
| `GET` | `/api/v1/checkins/{event_id}/log` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | List checked-in attendees |

### 2.7 Announcements & Memories (`/api/v1/announcements`, `/api/v1/memories`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/announcements` | Bearer | All | Get announcements |
| `POST` | `/api/v1/announcements` | Bearer | `SCHOOL_ADMIN`, `BATCH_COORDINATOR` | Create announcement |
| `GET` | `/api/v1/memories` | Bearer | All | Get photos by event/batch |
| `POST` | `/api/v1/memories/upload` | Bearer | Verified Alumni | Upload event memory photo (Azure Blob Storage) |
| `DELETE` | `/api/v1/memories/{memory_id}` | Bearer | Owner / Admin | Delete photo |

### 2.8 Reports & Audit (`/api/v1/reports`, `/api/v1/audit`)
| Method | Path | Auth | Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/summary` | Bearer | `SCHOOL_ADMIN` | Aggregate stats (Total alumni, RSVP, check-in counts) |
| `GET` | `/api/v1/reports/export-alumni` | Bearer | `SCHOOL_ADMIN` | Export alumni CSV |
| `GET` | `/api/v1/reports/export-attendance` | Bearer | `SCHOOL_ADMIN` | Export event attendance CSV |
| `GET` | `/api/v1/audit/logs` | Bearer | `SCHOOL_ADMIN` | View security & system audit logs |
