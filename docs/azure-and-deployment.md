# Azure Architecture, Deployment & Environment Configuration

## 1. Azure Resource Organization

```text
Azure Subscription
│
├── Resource Group: rg-alumni-prod
│   ├── Azure App Service / Container App (FastAPI Backend)
│   ├── Azure Cosmos DB for MongoDB (or MongoDB Atlas Azure Integration)
│   ├── Azure Blob Storage (Account: stgandalumni, Container: memories)
│   ├── Azure Application Insights (Monitoring & Telemetry)
│   └── Azure Key Vault (Secrets Management)
│
└── Resource Group: rg-alumni-dev
    ├── Azure App Service (Dev Backend API)
    ├── Azure Blob Storage (Container: dev-memories)
    └── Azure Application Insights
```

---

## 2. Environment Variables Specification

### Backend Environment Variables (`.env`)
```bash
# Application Environment
APP_ENV=development # development | qa | production
PORT=8000
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "https://alumni.abcschool.edu"]

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=school_alumni_db

# Security & JWT
JWT_SECRET=super-secret-jwt-key-must-be-at-least-32-chars-long
JWT_ALGORITHM=HS256
JWT_ACCESS_EXPIRE_MINUTES=1440 # 24 hours
JWT_REFRESH_EXPIRE_DAYS=30

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true
AZURE_STORAGE_CONTAINER=alumni-memories

# Firebase Push Notifications (Optional / Mocked in local dev)
FIREBASE_PROJECT_ID=abc-school-alumni
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@abc-school-alumni.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Seed Admin Credentials
INITIAL_SCHOOL_NAME="ABC School"
INITIAL_SCHOOL_CODE="ABC"
INITIAL_ADMIN_MOBILE="+919876543210"
INITIAL_ADMIN_OTP="123456"
```

---

## 3. GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`)

```yaml
name: Build, Test & Deploy

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r backend/requirements.txt pytest httpx
      - name: Run pytest
        run: |
          cd backend && pytest tests/

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Build Admin Web
        run: |
          cd admin-web
          npm ci
          npm run build
```
