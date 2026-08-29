# Production Deployment Guide: Azure & Infrastructure

## 1. Overview
This document specifies the production infrastructure, Azure resource organization, security configurations, and GitHub Actions CI/CD deployment pipeline for the **School Alumni Platform ("JustGatherNow")**.

---

## 2. Azure Infrastructure Architecture

```text
Azure Subscription
│
└── Resource Group: rg-alumni-prod
    ├── Azure App Service / Container App (FastAPI Backend)
    │   └── Production URL: https://api.alumni.abcschool.edu
    ├── Azure Cosmos DB for MongoDB (or MongoDB Atlas Azure Integration)
    │   └── Database: school_alumni_prod_db
    ├── Azure Blob Storage Account (stgandalumniprod)
    │   └── Container: alumni-memories
    ├── Azure Application Insights (Telemetry & Monitoring)
    ├── Azure Key Vault (Secrets Management)
    └── Azure Custom Domain & Managed SSL Certificate
```

---

## 3. Production Environment Variables Checklist

Set the following secrets in Azure Key Vault / App Service Application Settings:

```bash
APP_ENV=production
PORT=8000
CORS_ORIGINS=["https://alumni.abcschool.edu","https://admin.abcschool.edu"]

MONGODB_URI=mongodb+srv://prod_user:SECRET_PASSWORD@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=school_alumni_prod_db

JWT_SECRET=CRITICAL_32_PLUS_CHAR_CRYPTOGRAPHIC_RANDOM_KEY
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30

AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=stgandalumniprod;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER=alumni-memories

FIREBASE_PROJECT_ID=abc-school-alumni-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@abc-school-alumni-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## 4. Production Startup Validation
The backend automatically executes `settings.validate_production_secrets()` during startup when `APP_ENV=production`:
- If `JWT_SECRET` contains default fallback strings or is under 32 characters, startup terminates immediately with `RuntimeError`.
- If `MONGODB_URI` points to `localhost`, startup terminates immediately.
- If `CORS_ORIGINS` contains `*`, startup terminates immediately.

---

## 5. GitHub Actions Deployment Pipeline (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy Production

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt pytest httpx
      - name: Run Pytest Suite
        run: |
          cd backend && python -m pytest tests/

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Web Admin
        run: |
          cd admin-web && npm ci && npm run build
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'app-alumni-prod'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```
