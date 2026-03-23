/**
 * Fill Empty Freezer Temperatures Script
 *
 * Finds all FREEZERS-BY-DATE records for a given user where temperatureMorning
 * or temperatureAfternoon are empty ('', null, undefined) and fills them with
 * a random value between -25 and -18 (1 decimal place).
 *
 * Usage:
 *   node fill-empty-freezers.js <service-account.json> [userName|email|urid] [startDate] [endDate]
 *
 * Examples:
 *   node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23
 *   node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json student@student.gr
 *   node fill-empty-freezers.js ./health-dossier-9c4e24879fde.json
 */
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const USER_ARG             = process.argv[3] || null;
const START_DATE           = process.argv[4] ? new Date(process.argv[4]) : null;
const END_DATE             = process.argv[5] ? new Date(process.argv[5]) : null;

if (!SERVICE_ACCOUNT_PATH) {
  console.error('Usage: node fill-empty-freezers.js <service-account.json> [userName|email|urid] [startDate] [endDate]');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Freezer temperature range: -25.0 to -18.0
function randomFreezerTemp() {
  return Math.round((Math.random() * 7 - 25) * 10) / 10;
}

function toDateOnly(d) {
  // Strip time — compare by local date only (avoids UTC vs UTC+2 mismatch)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function inRange(docDate) {
  if (!START_DATE && !END_DATE) return true;
  const d     = docDate instanceof admin.firestore.Timestamp ? docDate.toDate() : new Date(docDate);
  const dOnly = toDateOnly(d);
  if (START_DATE && dOnly < toDateOnly(START_DATE)) return false;
  if (END_DATE   && dOnly > toDateOnly(END_DATE))   return false;
  return true;
}

async function findUserByNameOrEmail(nameOrEmail) {
  // Looks like a raw urid (no spaces, no @, long string)
  if (nameOrEmail.length > 20 && !nameOrEmail.includes(' ') && !nameOrEmail.includes('@')) {
    return { urid: nameOrEmail };
  }
  const isEmail = nameOrEmail.includes('@');
  const field   = isEmail ? 'email' : 'name';
  let snap = await db.collection('users').where(field, '==', nameOrEmail).get();
  if (snap.empty) {
    const lower   = nameOrEmail.toLowerCase();
    const allSnap = await db.collection('users').get();
    const match   = allSnap.docs.find(d => (d.data()[field] || '').toLowerCase() === lower);
    if (match) return { urid: match.data().urid, name: match.data().name };
    return null;
  }
  const data = snap.docs[0].data();
  return { urid: data.urid, name: data.name };
}

async function fillFreezers(urid) {
  const colRef = db.collection('temperatures').doc(urid).collection('FREEZERS-BY-DATE');
  const snap   = await colRef.get();
  if (snap.empty) {
    console.log('   No FREEZERS-BY-DATE records found.');
    return 0;
  }

  let updated    = 0;
  let skipped    = 0;
  let batch      = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!inRange(data.date)) { skipped++; continue; }

    const updates = {};
    if (data.temperatureMorning === '' || data.temperatureMorning === undefined || data.temperatureMorning === null) {
      updates.temperatureMorning = randomFreezerTemp();
    }
    if (data.temperatureAfternoon === '' || data.temperatureAfternoon === undefined || data.temperatureAfternoon === null) {
      updates.temperatureAfternoon = randomFreezerTemp();
    }

    if (Object.keys(updates).length > 0) {
      const dateLabel = data.date instanceof admin.firestore.Timestamp
        ? data.date.toDate().toISOString().split('T')[0]
        : String(data.date);
      console.log('   Filling: name=' + data.name + '  date=' + dateLabel +
        '  tM=' + (updates.temperatureMorning ?? '(kept)') +
        '  tA=' + (updates.temperatureAfternoon ?? '(kept)'));
      batch.update(doc.ref, updates);
      batchCount++;
      updated++;
      if (batchCount >= 490) {
        await batch.commit();
        batch      = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) await batch.commit();
  if (skipped > 0) console.log('   Skipped (out of date range): ' + skipped);
  return updated;
}

async function main() {
  console.log('===================================================');
  console.log('  Fill Empty Freezer Temperatures Script');
  console.log('  Range: -25.0°C  to  -18.0°C');
  console.log('===================================================');
  console.log('  User  : ' + (USER_ARG || 'ALL'));
  if (START_DATE) console.log('  From  : ' + START_DATE.toDateString());
  if (END_DATE)   console.log('  To    : ' + END_DATE.toDateString());
  console.log('---------------------------------------------------\n');

  let urids = [];

  if (USER_ARG) {
    const found = await findUserByNameOrEmail(USER_ARG);
    if (!found) {
      console.error('User "' + USER_ARG + '" not found in the users collection.');
      process.exit(1);
    }
    console.log('Found user: name="' + (found.name || '—') + '"  urid="' + found.urid + '"\n');
    urids = [found.urid];
  } else {
    const refs = await db.collection('temperatures').listDocuments();
    urids = refs.map(r => r.id);
    console.log('Processing ' + urids.length + ' user(s).\n');
  }

  let grandTotal = 0;
  for (const urid of urids) {
    console.log('-- User: ' + urid);
    const n = await fillFreezers(urid);
    console.log('   Total updated: ' + n + '\n');
    grandTotal += n;
  }

  console.log('---------------------------------------------------');
  console.log('  Done! Updated ' + grandTotal + ' freezer record(s).');
  console.log('===================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

