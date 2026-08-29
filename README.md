# School Alumni Management & Get-Together Platform ("JustGatherNow")

A production-ready, SaaS-architected School Alumni Management and Batch Get-Together Platform initially configured for **ABC School**.

---

## 1. System Architecture & Tech Stack

### Backend
- **Python 3.11+**, **FastAPI**, **Motor / PyMongo** (Async MongoDB Driver), **Pydantic v2**
- **JWT & OTP Security**, Cryptographic Event QR Ticket Tokens
- **Azure Blob Storage SDK** (with local media storage fallback)

### Frontend Web Admin
- **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**
- Multi-dashboard module for School Admin and Batch Coordinators

### Mobile Alumni Application
- **React Native / Expo & Web Simulator Architecture**
- 19 Alumni Screens (OTP Auth, Registration, Verification Pending, Home Dashboard, Batch Cohorts Directory, RSVP Steppers, Secure Event QR Ticket, Announcements Feed, Photo Memories)

---

## 2. Directory Structure

```text
justgathernow/
├── backend/
│   ├── app/
│   │   ├── api/          # Auth, School, Batches, Alumni, Events, Attendance, Checkins, Announcements, Memories, Reports
│   │   ├── core/         # Config, Database Motor client, Security JWT/QR, Logging
│   │   ├── middleware/   # Auth bearer token & Tenant scope isolation
│   │   ├── schemas/      # Pydantic v2 models
│   │   ├── services/     # Azure Blob Storage & FCM Notifications
│   │   ├── main.py       # FastAPI Entry point
│   │   └── reset_db.py   # Database purge script & Primary Developer account initializer
│   └── tests/            # Pytest test suite for auth, tenant security, and QR check-in
├── admin-web/            # React + Vite + Tailwind Admin Web Portal (16 screens)
├── mobile-app/           # React Native / Web Mobile Alumni Application (19 screens)
└── docs/                 # System Architecture, Database Schemas, API Specs, Permission Matrix
```

---

## 3. Local Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ / npm
- MongoDB running locally on `mongodb://localhost:27017` (or MongoDB Atlas URI)

### Step 1: Install Backend & Reset Database
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Purge DB & initialize Primary Developer account (+917550375037)
python -m app.reset_db
```

### Step 2: Start Backend Server
```bash
# From workspace root or backend folder
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation available at: `http://localhost:8000/docs`

### Step 3: Run React Admin Web Portal
```bash
cd admin-web
npm install
npm run dev
```
- Admin Web URL: `http://localhost:5173`
- Default Admin Mobile: `+919876543210` (OTP: `123456`)

### Step 4: Run Mobile Alumni Application
```bash
cd mobile-app
npm install
npm run dev
```
- Mobile App URL: `http://localhost:5174`

---

## 4. Running Test Suites

```bash
cd backend
pytest tests/
```

---

## 5. End-to-End User Journey Walkthrough

1. **Mobile Login**: Open Mobile App (`http://localhost:5174`) -> Enter Mobile Number `+919876543210` -> Enter OTP `123456`.
2. **Registration**: Fill registration form for alumnus -> Application status moves to `PENDING`.
3. **Admin Verification**: Open Admin Web (`http://localhost:5173`) -> Go to **Verification Queue** -> Click **Approve**.
4. **Alumni Dashboard**: Mobile App status updates to `APPROVED` -> Access Alumni Home Dashboard & view Class of 2010 batchmates.
5. **Event RSVP**: Open "2010 Silver Jubilee Reunion" Event -> Select 2 Adults, 1 Child -> Click **Confirm RSVP**.
6. **QR Ticket**: View generated cryptographic Event Entry QR Ticket on Mobile.
7. **QR Check-in**: Open Admin **QR Check-in Terminal** -> Paste or scan ticket token -> Instant **CHECK-IN SUCCESSFUL** notification with guest counts.
8. **Memories**: Upload reunion memory photo from Mobile -> Appears in Admin Memories Gallery & Mobile Gallery.
9. **Reports**: View turnout analytics & export CSV Roster from Admin Web.
