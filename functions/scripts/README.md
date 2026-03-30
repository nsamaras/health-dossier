# Health Dossier — Admin Scripts

One-time and maintenance scripts for managing the Health Dossier Firebase database.

---

## Prerequisites

- Node.js installed
- Firebase service account key file: `health-dossier-9c4e24879fde.json` (already in this folder, never commit it)
- Twilio credentials in `functions/.env` (for WhatsApp scripts)

---

## Navigate to the scripts folder first (always)

```powershell
cd "C:\Users\samarasn\workspace\health-dossier\health-dossier\functions\scripts"
```

---

## 🔒 Firestore Backup & Restore

Backups are exported to Google Cloud Storage bucket:
```
gs://health-dossier-9c4e24879fde-backups/firestore/YYYY-MM-DD/
```

### One-time setup (do this once)

**1. Create the GCS backup bucket:**
```powershell
gcloud storage buckets create gs://health-dossier-9c4e24879fde-backups `
  --project=health-dossier-9c4e24879fde `
  --location=europe-west1 `
  --uniform-bucket-level-access
```

**2. Grant the service account export permissions:**
```powershell
# Get the default Cloud Functions service account email:
# health-dossier-9c4e24879fde@appspot.gserviceaccount.com

gcloud projects add-iam-policy-binding health-dossier-9c4e24879fde `
  --member="serviceAccount:health-dossier-9c4e24879fde@appspot.gserviceaccount.com" `
  --role="roles/datastore.importExportAdmin"

gcloud storage buckets add-iam-policy-binding gs://health-dossier-9c4e24879fde-backups `
  --member="serviceAccount:health-dossier-9c4e24879fde@appspot.gserviceaccount.com" `
  --role="roles/storage.admin"
```

**3. Deploy the backup Cloud Function:**
```powershell
cd ..   # go to functions/
firebase deploy --only functions:scheduledFirestoreBackup
```

---

### Automatic backup (Cloud Function)

The `scheduledFirestoreBackup` Cloud Function runs automatically every day at **03:00 Athens time**.
- Exports ALL Firestore collections
- Saves to `gs://health-dossier-9c4e24879fde-backups/firestore/YYYY-MM-DD/`
- No manual action needed once deployed

---

### `backup-firestore.js` — Manual backup

Run anytime to trigger an immediate export.

```powershell
# Backup today
node backup-firestore.js ./health-dossier-9c4e24879fde.json

# Backup with a specific date label
node backup-firestore.js ./health-dossier-9c4e24879fde.json 2026-03-26
```

The export runs **asynchronously** — the script starts it and exits. Check progress at:
```
https://console.cloud.google.com/storage/browser/health-dossier-9c4e24879fde-backups/firestore
```

---

### `restore-firestore.js` — Restore from backup

> ⚠️ **WARNING:** Restoring will **overwrite** existing Firestore documents with the same IDs.
> Always make a fresh backup before restoring.

```powershell
# Restore from a specific date
node restore-firestore.js ./health-dossier-9c4e24879fde.json 2026-03-26
```

The script asks for confirmation before proceeding. The import also runs asynchronously.

---

### View available backups

```powershell
gcloud storage ls gs://health-dossier-9c4e24879fde-backups/firestore/
```

Or open in browser:
```
https://console.cloud.google.com/storage/browser/health-dossier-9c4e24879fde-backups/firestore
```

---
---

## Scripts

### 1. `backfill-temperatures.js`
Creates **empty placeholder records** in Firestore for dates where a user has not logged temperatures.
Must be run **before** the fill scripts.

Supports an optional `type` argument to target a **specific category** only.

| Category | Fields created |
|---|---|
| Fridges | `temperatureMorning: ''`, `temperatureAfternoon: ''` |
| Freezers | `temperatureMorning: ''`, `temperatureAfternoon: ''` |
| Hots | `temperature: ''` |
| Cooked | `temperature: ''` |

**Usage:**
```powershell
node backfill-temperatures.js <service-account.json> [userName|email] [startDate] [endDate] [type]
```

`type` is optional: `fridges` | `freezers` | `hots` | `cooked` | `all` (default: `all`)

```powershell
# All categories
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24

# Fridges only
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24 fridges

# Freezers only
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24 freezers

# Hots only
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24 hots

# Cooked only
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24 cooked

# By email
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student@student.gr 2026-03-01 2026-03-23

# All users
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json
```

---

### 2. `fill-empty-fridges.js`
Fills **empty fridge AND freezer temperature records** with random integer values matching the UI select options.

- **Fridges:** integer from `[0, 1, 2, 3, 4, 5, 6]` °C
- **Freezers:** integer from `[-18, -19, -20, -21, -22, -23]` °C
- **Fields:** `temperatureMorning`, `temperatureAfternoon`
- **Collections:** `FRIDGES-BY-DATE` **and** `FREEZERS-BY-DATE`
- Safe to re-run — already filled records are **not touched**

> ℹ️ This script covers **both fridges and freezers** — no need to run `fill-empty-freezers.js` separately.

**Usage:**
```powershell
# By name
node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# By email
node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student@student.gr 2026-03-01 2026-03-23

# All users
node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json
```

---

### 3. `fill-empty-freezers.js`
Fills **empty freezer temperature records** with random integer values.

- **Options:** `-18, -19, -20, -21, -22, -23` °C
- **Fields:** `temperatureMorning`, `temperatureAfternoon`
- **Collection:** `FREEZERS-BY-DATE`
- Safe to re-run — already filled records are **not touched**

> ⚠️ `fill-empty-fridges.js` already covers freezers — this script is only needed if you want to fill freezers **without** touching fridges.

**Usage:**
```powershell
node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23
```

---

### 4. `fill-empty-hots.js`
Fills **empty hot-holding temperature records** with random realistic values.

- **Range:** `63.0°C` to `85.0°C`
- **Field:** `temperature`
- **Collection:** `HOTS-BY-DATE`
- Safe to re-run — already filled records are **not touched**

**Usage:**
```powershell
node fill-empty-hots.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23
```

---

### 5. `send-whatsapp-user.js`
Sends a **WhatsApp message** to a user by looking up their `phoneNumber` from the Firestore `users` collection.

Requires Twilio credentials in `functions/.env`:
```dotenv
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886
```

> ⚠️ The recipient must have joined the Twilio WhatsApp sandbox first by sending `join <sandbox-word>` to `+14155238886`.

**Usage:**
```powershell
# Send default "Hello" message
node send-whatsapp-user.js student

# Send custom message by name
node send-whatsapp-user.js student "Γεια σου! Μήνυμα από Health Dossier 🌡️"

# Send custom message by email
node send-whatsapp-user.js student@student.gr "Γεια σου!"
```

---

### 6. `test-whatsapp.js`
Sends a **test WhatsApp message** directly to a phone number (bypasses Firestore user lookup).
Useful for testing Twilio credentials and sandbox connectivity.

**Usage:**
```powershell
# Send default test message
node test-whatsapp.js +309647224486

# Send custom message
node test-whatsapp.js +309647224486 "Γεια σου! Test μήνυμα 🌡️"
```

---

### 7. `send-email-user.js`
Sends an **email** to a user by looking up their `email` from the Firestore `users` collection.

Requires Gmail credentials in `functions/.env`:
```dotenv
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

> ℹ️ Use a **Gmail App Password** — not your real Gmail password.
> Google Account → Security → 2-Step Verification → App Passwords

**Usage:**
```powershell
# By name
node send-email-user.js student "Καλησπέρα" "Παρακαλώ καταχωρίστε τις θερμοκρασίες σας."

# By email
node send-email-user.js student@student.gr "Υπενθύμιση" "Μήνυμα από Health Dossier."
```

---

### 8. `query-by-date.js`
Queries a Firestore collection and returns all documents matching a **specific date** and optionally a **urid**.
Useful for inspecting what temperature records exist for a given day.

**Usage:**
```powershell
node query-by-date.js <service-account.json> <collectionPath> <date DD/MM/YYYY> [urid]
```

**Examples:**
```powershell
# Query FRIDGES-BY-DATE for a specific user on a specific date
node query-by-date.js ./health-dossier-9c4e24879fde.json "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FRIDGES-BY-DATE" "24/03/2026" "WNsdw7QThbXtNcWGo33YB4P9p2V2"

# Query FREEZERS-BY-DATE
node query-by-date.js ./health-dossier-9c4e24879fde.json "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS-BY-DATE" "24/03/2026" "WNsdw7QThbXtNcWGo33YB4P9p2V2"
```

---

### 9. `copy-document.js`
Copies **all fields** from one Firestore document to another.

**Usage:**
```powershell
node copy-document.js <service-account.json> <sourcePath> <destPath> [--merge]
```

| Mode | Behaviour |
|---|---|
| *(default)* | Overwrites the entire destination document |
| `--merge` | Only adds/updates copied fields, keeps other destination fields |

---

### 10. `copy-collection.js`
Copies **all documents** from one Firestore collection to another.

**Usage:**
```powershell
node copy-collection.js <service-account.json> <sourcePath> <destPath> [--merge]
```

**Examples:**
```powershell
# Copy FRIDGES → FRIDGES-LIST
node copy-collection.js ./health-dossier-9c4e24879fde.json "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FRIDGES" "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FRIDGES-LIST"

# Copy FREEZERS → FREEZERS-LIST
node copy-collection.js ./health-dossier-9c4e24879fde.json "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS" "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS-LIST"
```

---

### 11. `run-daily-temperature-fill.js`
Manual test runner for the `dailyTemperatureFill` Cloud Function.
Processes only the **student user** (`WNsdw7QThbXtNcWGo33YB4P9p2V2`) for fridges and freezers.

**Usage:**
```powershell
# Run for today
node run-daily-temperature-fill.js ./health-dossier-9c4e24879fde.json

# Run for a specific date
node run-daily-temperature-fill.js ./health-dossier-9c4e24879fde.json 2026-03-26
```

---

## Normal workflow for backfilling temperatures

### Fridges + Freezers only (2 steps)
```powershell
# Step 1 — Create empty records (fridges + freezers)
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24 fridges
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24 freezers

# Step 2 — Fill values for both fridges AND freezers
node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24
```

### All categories (4 steps)
```powershell
# Step 1 — Create empty records for all categories
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24

# Step 2 — Fill fridges + freezers
node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24

# Step 3 — Fill hots
node fill-empty-hots.js ./health-dossier-9c4e24879fde.json student 2026-03-24 2026-03-24
```

---

## Temperature value reference

All fill scripts now generate **integer values only**, matching the Angular UI select options exactly:

| Category | Valid values |
|---|---|
| Fridges | `0, 1, 2, 3, 4, 5, 6` °C |
| Freezers | `-18, -19, -20, -21, -22, -23` °C |
| Hots | `63.0` – `85.0` °C |

---

## Date reference

| Month | Last day |
|---|---|
| January | 31 |
| February 2026 | 28 (not a leap year) |
| March | 31 |
| April | 30 |
| May | 31 |
| June | 30 |

---

## Important notes

- ⚠️ **Never commit** `health-dossier-9c4e24879fde.json` — it is already in `.gitignore`
- ⚠️ **Never commit** `functions/.env` — it contains Twilio secrets
- ✅ All fill scripts are **safe to re-run** — they only update empty fields
- 🕙 The **daily Cloud Function** (`dailyTemperatureFill`) runs automatically every night at **23:00 Athens time** for the **student user only** (`WNsdw7QThbXtNcWGo33YB4P9p2V2`) — no manual action needed for fridges and freezers
