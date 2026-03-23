/**
 * Temperature Backfill Script
 *
 * Inserts placeholder temperature records for users who have NOT recorded
 * temperatures in a given date range.
 *
 * Urids are discovered automatically:
 *  - If a user name/email is given => looks up in Firestore `users` collection
 *  - If omitted => processes ALL users found in the `temperatures` collection
 *
 * Usage:
 *   node backfill-temperatures.js <service-account.json> [userName|email] [startDate] [endDate]
 *
 * Examples:
 *   node backfill-temperatures.js ./key.json
 *   node backfill-temperatures.js ./key.json student
 *   node backfill-temperatures.js ./key.json student 2026-03-01 2026-03-23
 *   node backfill-temperatures.js ./key.json student@email.com 2026-01-01 2026-03-23
 */
const admin = require('firebase-admin');
const SERVICE_ACCOUNT_PATH = process.argv[2];
const USER_ARG             = process.argv[3] || null;
const START_DATE           = new Date(process.argv[4] || '2026-03-01');
const END_DATE             = new Date(process.argv[5] || '2026-03-23');
if (!SERVICE_ACCOUNT_PATH) {
  console.error('Usage: node backfill-temperatures.js <service-account.json> [userName|email] [startDate] [endDate]');
  process.exit(1);
}
const CATEGORIES = [
  { list: 'FRIDGES-LIST',  fallback: 'FRIDGES',  byDate: 'FRIDGES-BY-DATE',  slotBased: true  },
  { list: 'FREEZERS-LIST', fallback: 'FREEZERS', byDate: 'FREEZERS-BY-DATE', slotBased: true  },
  { list: 'HOTS-LIST',     fallback: 'HOTS',     byDate: 'HOTS-BY-DATE',     slotBased: false },
  { list: 'COOKED-LIST',   fallback: 'COOKED',   byDate: 'COOKED-BY-DATE',   slotBased: false },
];
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
function buildDateRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) { dates.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return dates;
}
async function flushBatch(batch, count) {
  if (count > 0) await batch.commit();
  return { batch: db.batch(), count: 0 };
}
async function findUserByNameOrEmail(nameOrEmail) {
  const isEmail = nameOrEmail.includes('@');
  const field   = isEmail ? 'email' : 'name';
  let snap = await db.collection('users').where(field, '==', nameOrEmail).get();
  if (snap.empty) {
    const lower    = nameOrEmail.toLowerCase();
    const allSnap  = await db.collection('users').get();
    const match    = allSnap.docs.find(d => (d.data()[field] || '').toLowerCase() === lower);
    if (match) return { urid: match.data().urid, name: match.data().name, email: match.data().email };
    return null;
  }
  const data = snap.docs[0].data();
  return { urid: data.urid, name: data.name, email: data.email };
}
async function processUser(urid, dates) {
  let userTotal = 0;
  let { batch, count: batchCount } = { batch: db.batch(), count: 0 };
  for (const { list, fallback, byDate, slotBased } of CATEGORIES) {
    let profileSnap = await db.collection('temperatures').doc(urid).collection(list).get();
    if (profileSnap.empty) {
      profileSnap = await db.collection('temperatures').doc(urid).collection(fallback).get();
    }
    if (profileSnap.empty) continue;
    const profileItems = profileSnap.docs.map(d => d.data());
    console.log('  [' + byDate + '] ' + profileItems.length + ' profile item(s)');
    for (const dateObj of dates) {
      const midnight = new Date(dateObj);
      midnight.setHours(0, 0, 0, 0);
      const timestamp = admin.firestore.Timestamp.fromDate(midnight);
      const dateLabel = midnight.toISOString().split('T')[0];
      const existingSnap = await db
        .collection('temperatures').doc(urid).collection(byDate)
        .where('date', '==', timestamp).get();
      const recordedNames = new Set(existingSnap.docs.map(d => d.data().name));
      let dayCount = 0;
      for (const item of profileItems) {
        if (recordedNames.has(item.name)) continue;
        const docId  = db.collection('_').doc().id;
        const docRef = db.collection('temperatures').doc(urid).collection(byDate).doc(docId);
        const record = { urid: urid, name: item.name, category: byDate, docId: docId, date: timestamp };
        if (slotBased) {
          record.temperatureMorning   = '';
          record.temperatureAfternoon = '';
        } else {
          record.temperature = '';
        }
        batch.set(docRef, record);
        batchCount++;
        dayCount++;
        userTotal++;
        if (batchCount >= 490) {
          ({ batch, count: batchCount } = await flushBatch(batch, batchCount));
        }
      }
      if (dayCount > 0) console.log('    [' + dateLabel + '] +' + dayCount + ' record(s)');
    }
  }
  await flushBatch(batch, batchCount);
  return userTotal;
}
async function backfill() {
  console.log('===================================================');
  console.log('  Temperature Backfill Script');
  console.log('===================================================');
  console.log('  User  : ' + (USER_ARG || 'ALL USERS'));
  console.log('  From  : ' + START_DATE.toDateString());
  console.log('  To    : ' + END_DATE.toDateString());
  console.log('---------------------------------------------------\n');
  const dates = buildDateRange(START_DATE, END_DATE);
  let usersToProcess = [];
  if (USER_ARG) {
    console.log('Looking up user "' + USER_ARG + '" in Firestore users collection...');
    const found = await findUserByNameOrEmail(USER_ARG);
    if (!found) {
      console.error('User "' + USER_ARG + '" not found in the users collection.');
      process.exit(1);
    }
    console.log('Found: name="' + found.name + '"  email="' + found.email + '"  urid="' + found.urid + '"\n');
    usersToProcess = [found.urid];
  } else {
    const userRefs = await db.collection('temperatures').listDocuments();
    if (userRefs.length === 0) {
      console.log('No users found in temperatures collection.');
      process.exit(0);
    }
    console.log('Found ' + userRefs.length + ' user(s) in Firestore.\n');
    usersToProcess = userRefs.map(r => r.id);
  }
  let grandTotal = 0;
  for (const urid of usersToProcess) {
    console.log('-- User: ' + urid);
    const created = await processUser(urid, dates);
    console.log('   Created ' + created + ' record(s)\n');
    grandTotal += created;
  }
  console.log('---------------------------------------------------');
  console.log('  Done! Created ' + grandTotal + ' placeholder record(s) across ' + usersToProcess.length + ' user(s).');
  console.log('===================================================');
  process.exit(0);
}
backfill().catch(function(err) {
  console.error('Error during backfill:', err);
  process.exit(1);
});
