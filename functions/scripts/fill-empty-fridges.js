/**
 * Fill Empty Fridge Temperatures Script
 *
 * Finds all FRIDGES-BY-DATE records for a given user where temperatureMorning
 * or temperatureAfternoon are empty ('', null, undefined) and fills them with
 * a random integer value matching the UI select options (0–6 for fridges, -18 to -23 for freezers).
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

// Must match exactly the mat-select options in the Angular UI
const FRIDGE_OPTIONS  = [0, 1, 2, 3, 4, 5, 6];
const FREEZER_OPTIONS = [-18, -19, -20, -21, -22, -23];
const pickOption = (options) => options[Math.floor(Math.random() * options.length)];

function randomTemp(collectionName) {
  if (collectionName && collectionName.startsWith('FREEZER')) return pickOption(FREEZER_OPTIONS);
  return pickOption(FRIDGE_OPTIONS);
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
        updates.temperatureMorning = randomTemp(collectionName);
      }
      if (data.temperatureAfternoon === '' || data.temperatureAfternoon === undefined || data.temperatureAfternoon === null) {
        updates.temperatureAfternoon = randomTemp(collectionName);
      }
    } else {
      if (data.temperature === '' || data.temperature === undefined || data.temperature === null) {
        updates.temperature = randomTemp(collectionName);
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
  console.log('  Fridges: 0–6°C (integers) | Freezers: -18 to -23°C (integers)');
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

