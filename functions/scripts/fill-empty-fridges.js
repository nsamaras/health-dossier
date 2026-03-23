/**
 * Fill Empty Fridge Temperatures Script
 *
 * Finds all FRIDGES-BY-DATE records for a given user where temperatureMorning
 * or temperatureAfternoon are empty ('', null, undefined) and fills them with
 * a random value between 0 and 6 (1 decimal place).
 *
 * Usage:
 *   node fill-empty-fridges.js <service-account.json> [userName|email|urid] [startDate] [endDate]
 *
 * Examples:
 *   # By name
 *   node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student 2026-03-01 2026-03-23
 *   # By email
 *   node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json student@student.gr 2026-03-01 2026-03-23
 *   # All users
 *   node fill-empty-fridges.js ./health-dossier-9c4e24879fde.json
 */
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const USER_ARG             = process.argv[3] || null;
const START_DATE           = process.argv[4] ? new Date(process.argv[4]) : null;
const END_DATE             = process.argv[5] ? new Date(process.argv[5]) : null;

if (!SERVICE_ACCOUNT_PATH) {
  console.error('Usage: node fill-empty-fridges.js <service-account.json> [userName|email|urid] [startDate] [endDate]');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const SLOT_COLLECTIONS    = ['FRIDGES-BY-DATE', 'FREEZERS-BY-DATE'];
const NONSLOT_COLLECTIONS = ['HOTS-BY-DATE', 'COOKED-BY-DATE'];

function randomTemp() {
  // Random float between 0.0 and 6.0 with 1 decimal place
  return Math.round(Math.random() * 60) / 10;
}

async function findUserByNameOrEmail(nameOrEmail) {
  // Check if it looks like a urid (no spaces, long string)
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

async function fillCollection(urid, collectionName, slotBased) {
  const colRef = db.collection('temperatures').doc(urid).collection(collectionName);
  const snap   = await colRef.get();
  if (snap.empty) return 0;

  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!inRange(data.date)) continue;

    const updates = {};
    if (slotBased) {
      if (data.temperatureMorning === '' || data.temperatureMorning === undefined || data.temperatureMorning === null) {
        updates.temperatureMorning = randomTemp();
      }
      if (data.temperatureAfternoon === '' || data.temperatureAfternoon === undefined || data.temperatureAfternoon === null) {
        updates.temperatureAfternoon = randomTemp();
      }
    } else {
      if (data.temperature === '' || data.temperature === undefined || data.temperature === null) {
        updates.temperature = randomTemp();
      }
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      batchCount++;
      updated++;
      if (batchCount >= 490) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) await batch.commit();
  return updated;
}

async function main() {
  console.log('===================================================');
  console.log('  Fill Empty Fridge Temperatures Script');
  console.log('  Range: 0.0°C  to  6.0°C');
  console.log('===================================================');
  console.log('  User  : ' + (USER_ARG || 'ALL'));
  if (START_DATE) console.log('  From  : ' + START_DATE.toDateString());
  if (END_DATE)   console.log('  To    : ' + END_DATE.toDateString());
  console.log('---------------------------------------------------\n');

  let urids = [];

  if (USER_ARG) {
    const found = await findUserByNameOrEmail(USER_ARG);
    if (!found) {
      console.error('User "' + USER_ARG + '" not found.');
      process.exit(1);
    }
    console.log('Found user: ' + JSON.stringify(found) + '\n');
    urids = [found.urid];
  } else {
    const refs = await db.collection('temperatures').listDocuments();
    urids = refs.map(r => r.id);
    console.log('Processing ' + urids.length + ' user(s).\n');
  }

  let grandTotal = 0;
  for (const urid of urids) {
    console.log('-- User: ' + urid);
    let total = 0;
    for (const col of SLOT_COLLECTIONS) {
      const n = await fillCollection(urid, col, true);
      if (n > 0) console.log('   [' + col + '] updated ' + n + ' record(s)');
      total += n;
    }
    for (const col of NONSLOT_COLLECTIONS) {
      const n = await fillCollection(urid, col, false);
      if (n > 0) console.log('   [' + col + '] updated ' + n + ' record(s)');
      total += n;
    }
    console.log('   Total updated: ' + total + '\n');
    grandTotal += total;
  }

  console.log('---------------------------------------------------');
  console.log('  Done! Updated ' + grandTotal + ' record(s).');
  console.log('===================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

