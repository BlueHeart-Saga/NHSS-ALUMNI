# API Integration & Service Layer Contract

## 1. Overview
This document specifies the REST API integration contracts between the frontends (**Admin Web** and **Mobile Alumni App**) and the **FastAPI Async Backend**. All data operations strictly interact with MongoDB through FastAPI routers.

---

## 2. API Response & Error Contracts

### Standard Success Response
All single resource responses return the JSON object directly. List queries return arrays or paginated list items:
```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  }
}
```

### Standard Error Response
API errors return HTTP status codes with structured detail objects:
```json
{
  "detail": "Detailed user-friendly error message"
}
```

| HTTP Status Code | Meaning | Frontend Handling |
| :---: | :--- | :--- |
| `401 Unauthorized` | Invalid/expired JWT token | Redirects user to Login screen and clears local token |
| `403 Forbidden` | Insufficient role permissions | Displays access denied alert banner |
| `404 Not Found` | Requested resource missing | Displays empty state view |
| `409 Conflict` | Event capacity overbooked | Blocks RSVP and displays capacity exceeded alert |
| `422 Unprocessable` | Schema validation error | Displays field validation error highlight |
| `500 Server Error` | Unexpected backend error | Displays retry prompt toast |

---

## 3. Centralized API Service Files

- **Admin Web API Client**: [admin-web/src/services/api.ts](file:///c:/sagadevan/Projects/justgathernow/admin-web/src/services/api.ts)
- **Mobile Alumni API Client**: [mobile-app/src/services/api.ts](file:///c:/sagadevan/Projects/justgathernow/mobile-app/src/services/api.ts)

---

## 4. Server State Invalidation & Data Flow Rules

```text
User Form Submission (e.g. Create Event / RSVP / Verify Alumni)
    │
    ▼
HTTP POST / PUT / DELETE Request to FastAPI Endpoint
    │
    ▼
FastAPI Handler Executes Business Logic & Mutates MongoDB
    │
    ▼
FastAPI Returns Updated Document JSON Response
    │
    ▼
Frontend API Promise Resolves -> Invalidate / Refetch State Query
    │
    ▼
UI Component Updates with Fresh MongoDB State
```

---

## 5. Security & Authorization Rules

1. **JWT Header**: Every authenticated request attaches `Authorization: Bearer <token>`.
2. **Tenant Isolation**: Backend automatically derives `school_id` from `current_user` token context.
3. **Role Enforcement**: FastAPI `require_roles(["SCHOOL_ADMIN"])` or `require_roles(["BATCH_COORDINATOR"])` decorates handlers.
