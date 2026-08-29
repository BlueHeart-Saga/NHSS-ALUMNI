# Data Flow Architecture & System Sequence Specification

## 1. Overview
This document specifies the exact data flow for every core module of the **School Alumni & Batch Get-Together Platform ("JustGatherNow")**, tracing request execution from the React Admin Web and Mobile Alumni interfaces down to FastAPI business logic services, MongoDB collection operations, and Azure Blob Storage.

---

## 2. Module Sequence Data Flows

### 2.1 Alumni Registration & Verification Data Flow
```text
React Native Mobile App
    │
    ├─► 1. POST /api/v1/alumni/register (Name, Mobile, Email, Passing Year, Admission No)
    │
FastAPI Alumni Service
    │
    ├─► 2. Validate input schemas & search for existing duplicates in MongoDB (`alumni` collection)
    ├─► 3. Insert new alumnus record with status="PENDING" into MongoDB (`alumni` collection)
    ├─► 4. Return registration confirmation payload
    │
Admin Web Verification Queue
    │
    ├─► 5. GET /api/v1/alumni/pending -> Fetches pending applications from MongoDB
    ├─► 6. Admin reviews applicant & clicks "Approve"
    ├─► 7. POST /api/v1/alumni/{id}/verify -> Updates status="APPROVED" in MongoDB (`alumni`)
    ├─► 8. Writes audit log entry into MongoDB (`audit_logs`)
    │
Mobile App Polling / Re-fetch
    │
    └─► 9. GET /api/v1/auth/me -> Returns status="APPROVED", granting full mobile app access
```

---

### 2.2 Reunion Event Creation & RSVP Capacity Enforcement Data Flow
```text
Admin Web Portal
    │
    ├─► 1. POST /api/v1/events (Title, Target Batch, Date, Venue, Max Capacity=300)
    │
FastAPI Event Service
    │
    ├─► 2. Inserts new event record into MongoDB (`events` collection) with status="PUBLISHED"
    │
Mobile Alumni App
    │
    ├─► 3. GET /api/v1/events -> Displays published get-together card
    ├─► 4. User selects 2 Adults, 1 Child -> Clicks "Confirm RSVP"
    ├─► 5. POST /api/v1/events/{id}/attendance
    │
FastAPI Attendance Service
    │
    ├─► 6. Aggregates existing confirmed attendees from MongoDB (`event_attendance`)
    ├─► 7. Checks: (Current Confirmed + New Requested) <= Event Max Capacity
    ├─► 8. If capacity OK -> Saves RSVP to MongoDB (`event_attendance`) & generates signed QR JWT Token
    ├─► 9. If capacity EXCEEDED -> Returns HTTP 409 Conflict ("Event capacity reached")
```

---

### 2.3 Venue QR Ticket Check-In Data Flow
```text
Mobile App (Alumnus Screen)
    │
    ├─► 1. GET /api/v1/events/{id}/ticket-qr -> Displays encrypted QR Code Token
    │
Venue QR Check-In Terminal (Admin Station)
    │
    ├─► 2. Admin scans QR code or enters ticket token
    ├─► 3. POST /api/v1/checkins/scan (Event ID, Token)
    │
FastAPI Check-In Service
    │
    ├─► 4. Decodes signed JWT ticket token & validates event_id, school_id, alumni_id
    ├─► 5. Queries MongoDB (`checkins`) to verify ticket is NOT already checked in
    ├─► 6. Inserts check-in record (timestamp, scanner ID, method="QR_SCAN") into MongoDB (`checkins`)
    ├─► 7. Returns GREEN success response with attendee name, batch, and total guest count
```

---

### 2.4 Photo Memories Upload & Moderation Data Flow
```text
Mobile Alumni App
    │
    ├─► 1. User selects reunion photo & enters title
    ├─► 2. POST /api/v1/memories/upload (Multipart form data: image file, event_id, caption)
    │
FastAPI Memory Service & PIL Processor
    │
    ├─► 3. Resizes & compresses image to WebP format (1600px main, 400px thumbnail)
    ├─► 4. Uploads WebP image & thumbnail to Azure Blob Storage container (`alumni-memories`)
    ├─► 5. Inserts photo metadata (image_url, thumbnail_url, uploaded_by, status="APPROVED") into MongoDB (`memories`)
    │
Admin Web Moderation Gallery
    │
    ├─► 6. GET /api/v1/memories -> Fetches photo gallery metadata from MongoDB
    └─► 7. Admin clicks Delete -> DELETE /api/v1/memories/{id} -> Removes metadata from MongoDB
```
