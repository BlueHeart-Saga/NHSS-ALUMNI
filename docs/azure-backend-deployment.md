# Separate Azure App Service Setup for FastAPI Backend

When deploying the Python FastAPI backend as a separate Azure Web App, use the following exact Azure configuration settings:

---

## 1. Azure Web App Instance Creation Settings

| Azure Configuration Option | Recommended Value |
| :--- | :--- |
| **Publish** | `Code` |
| **Runtime Stack** | **`Python 3.11`** (Recommended) or `Python 3.10` |
| **Operating System** | **`Linux`** |
| **Region** | `South India` (or same region as your frontend Web App) |
| **App Service Plan** | Basic (B1) or higher |

---

## 2. Configuration Settings (Azure Portal)

Navigate to **Azure Web App -> Settings -> Configuration**:

### A. General Settings -> Startup Command:
```bash
bash startup.sh
```
*(Or explicit Gunicorn command: `gunicorn --bind=0.0.0.0:${PORT:-8000} --workers=4 --worker-class uvicorn.workers.UvicornWorker app.main:app`)*

### B. Application Settings (Environment Variables):
Add the following keys under **Configuration -> Application Settings**:

| Setting Name | Value / Description |
| :--- | :--- |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` (Triggers automatic pip install during deployment) |
| `APP_ENV` | `production` |
| `PORT` | `8000` |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net` |
| `MONGODB_DATABASE` | `school_alumni_db` |
| `JWT_SECRET` | `<your-32-character-secret-key>` |
| `FRONTEND_URL` | `https://nhssalumni.com` |
| `CORS_ORIGINS` | `["https://nhssalumni.com","https://www.nhssalumni.com","https://nhss-alumni-backend-b7a8a8dffcrp6abha.southindia-01.azurewebsites.net","https://nhss-alumni-hucjandcaedncnhj.southindia-01.azurewebsites.net"]` |
| `GOOGLE_CLIENT_ID` | `<your-google-oauth-client-id>` |
| `GOOGLE_CLIENT_SECRET` | `<your-google-oauth-client-secret>` |
| `GOOGLE_REDIRECT_URI` | `https://nhss-alumni-backend-b7a8a8dffcrp6abha.southindia-01.azurewebsites.net/api/v1/auth/google/callback` |
| `SMTP_SERVER` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `devopstrioglobal@gmail.com` |
| `SMTP_PASS` | `rvaanwlmdcixyvbx` |
| `EMAILS_FROM_NAME` | `NHSS_ALUMNI-team` |
| `EMAILS_FROM_EMAIL` | `devopstrioglobal@gmail.com` |

---

## 3. GitHub Actions Workflow for Backend App Service

Create a workflow `.github/workflows/deploy-backend-azure.yml`:

```yaml
name: Deploy FastAPI Backend to Azure Web App

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Create Deployment Package
        run: |
          cd backend
          zip -r ../backend-deploy.zip . -x "*.pyc" "__pycache__/*"

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'NHSS-ALUMNI-API'
          package: './backend-deploy.zip'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_BACKEND_PUBLISHPROFILE }}
```
