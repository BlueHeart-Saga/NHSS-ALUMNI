# Database Backup, Retention & Disaster Recovery Strategy

## 1. Overview
This runbook details the database backup procedures, automated snapshot schedules, retention policies, and step-by-step restoration verification for the MongoDB cluster powering **ABC School Alumni Platform**.

---

## 2. Backup Schedule & Retention Policy

| Backup Type | Frequency | Execution Time | Retention Period | Target Storage |
| :--- | :--- | :--- | :--- | :--- |
| **Continuous Point-In-Time** | Continuous (Oplog) | Real-time | 7 Days | Azure Cosmos DB / MongoDB Atlas Automated Backup |
| **Daily Snapshot** | Once daily | 01:00 AM UTC | 30 Days | Geo-Redundant Azure Blob Storage (`stgandalumnibackup`) |
| **Weekly Archive** | Every Sunday | 02:00 AM UTC | 1 Year | Cold Archive Azure Storage |

---

## 3. Automated Backup Script (`scripts/backup_mongodb.sh`)

```bash
#!/usr/bin/env bash
set -eo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/mongodb_backup_${TIMESTAMP}"
CONTAINER_NAME="alumni-db-backups"

echo "[INFO] Starting MongoDB Automated Backup: ${TIMESTAMP}..."

# Export compressed dump using mongodump
mongodump --uri="${MONGODB_URI}" --db="${MONGODB_DATABASE}" --archive="${BACKUP_DIR}.tar.gz" --gzip

# Upload to Azure Blob Storage Archive
az storage blob upload \
  --account-name "stgandalumnibackup" \
  --container-name "${CONTAINER_NAME}" \
  --name "backup_${TIMESTAMP}.tar.gz" \
  --file "${BACKUP_DIR}.tar.gz" \
  --auth-mode login

echo "[SUCCESS] Backup completed and uploaded: backup_${TIMESTAMP}.tar.gz"
rm -f "${BACKUP_DIR}.tar.gz"
```

---

## 4. Step-by-Step Restoration Procedure

In the event of database corruption or disaster recovery:

1. **Identify Recovery Target Timestamp**: Locate the desired snapshot (`backup_YYYYMMDD_HHMMSS.tar.gz`) from Azure Blob Storage.
2. **Download Archive**:
   ```bash
   az storage blob download \
     --account-name "stgandalumnibackup" \
     --container-name "alumni-db-backups" \
     --name "backup_20261220_010000.tar.gz" \
     --file "./restore_target.tar.gz"
   ```
3. **Perform mongorestore**:
   ```bash
   mongorestore --uri="${MONGODB_URI}" --archive="./restore_target.tar.gz" --gzip --drop
   ```
4. **Verify Database Integrity**:
   - Verify collection document counts (`schools`, `users`, `alumni`, `batches`, `events`, `checkins`).
   - Run readiness probe `GET /ready` to confirm clean connection and index rebuilding.
