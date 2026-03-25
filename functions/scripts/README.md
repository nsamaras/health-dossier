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

## Scripts

### 1. `backfill-temperatures.js`
Creates **empty placeholder records** in Firestore for dates where a user has not logged temperatures.
Must be run **before** the fill scripts.

| Category | Fields created |
|---|---|
| Fridges | `temperatureMorning: ''`, `temperatureAfternoon: ''` |
| Freezers | `temperatureMorning: ''`, `temperatureAfternoon: ''` |
| Hots | `temperature: ''` |
| Cooked | `temperature: ''` |

**Usage:**
```powershell
# By name
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# By email
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student@student.gr 2026-03-01 2026-03-23

# All users
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json
```

---

### 2. `fill-empty-fridges.js`
Fills **empty fridge temperature records** with random realistic values.

- **Range:** `0.0°C` to `6.0°C`
- **Fields:** `temperatureMorning`, `temperatureAfternoon`
- **Collection:** `FRIDGES-BY-DATE`
- Safe to re-run — already filled records are **not touched**

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
Fills **empty freezer temperature records** with random realistic values.

- **Range:** `-25.0°C` to `-18.0°C`
- **Fields:** `temperatureMorning`, `temperatureAfternoon`
- **Collection:** `FREEZERS-BY-DATE`
- Safe to re-run — already filled records are **not touched**

**Usage:**
```powershell
# By name
node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# By email
node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json student@student.gr 2026-03-01 2026-03-23

# All users
node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json
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
# By name
node fill-empty-hots.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# By email
node fill-empty-hots.js ./health-dossier-9c4e24879fde.json student@student.gr 2026-03-01 2026-03-23

# All users
node fill-empty-hots.js ./health-dossier-9c4e24879fde.json
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
# Query FREEZERS-BY-DATE for a specific date and user
node query-by-date.js ./health-dossier-9c4e24879fde.json \
  "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS-BY-DATE" \
  "22/03/2026" \
  "WNsdw7QThbXtNcWGo33YB4P9p2V2"

# Query FRIDGES-BY-DATE (no urid filter)
node query-by-date.js ./health-dossier-9c4e24879fde.json \
  "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FRIDGES-BY-DATE" \
  "22/03/2026"
```

---

### 9. `copy-document.js`
Copies **all fields** from one Firestore document to another.

**Usage:**
```powershell
node copy-document.js <service-account.json> <sourcePath> <destPath> [--merge]
```

**Examples:**
```powershell
# Copy (overwrite destination)

# Copy and merge (keep existing destination fields)
node copy-document.js ./health-dossier-9c4e24879fde.json "users/abc123" "users/xyz789" --merge
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
node copy-collection.js ./health-dossier-9c4e24879fde.json \
  "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FRIDGES" \
  "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FRIDGES-LIST"

# Copy FREEZERS → FREEZERS-LIST
node copy-collection.js ./health-dossier-9c4e24879fde.json \
  "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS" \
  "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS-LIST"

# Copy and merge
node copy-collection.js ./health-dossier-9c4e24879fde.json \
  "temperatures/userId/FRIDGES" \
  "temperatures/userId/FRIDGES-LIST" --merge
```

---

## Normal workflow for backfilling temperatures

Run these in order:

```powershell
# Step 1 — Create empty records
node backfill-temperatures.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# Step 2 — Fill fridges (0°C to 6°C)
node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# Step 3 — Fill freezers (-25°C to -18°C)
node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23

# Step 4 — Fill hots (63°C to 85°C)
node fill-empty-hots.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23
```

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
- 🕙 The **daily Cloud Function** (`dailyTemperatureFill`) runs automatically every night at **22:00 Athens time** — no manual action needed

