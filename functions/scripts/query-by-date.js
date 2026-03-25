/**
 * Query Firestore Collection by Date and URID
 *
 * Usage:
 *   node query-by-date.js <service-account.json> <collectionPath> <date> [urid]
 *
 * Arguments:
 *   collectionPath : Full path to the collection (e.g. temperatures/userId/FREEZERS-BY-DATE)
 *   date           : Date in DD/MM/YYYY format
 *   urid           : Optional. Filter by urid field
 *
 * Examples:
 *   node query-by-date.js ./health-dossier-9c4e24879fde.json \
 *     "temperatures/WNsdw7QThbXtNcWGo33YB4P9p2V2/FREEZERS-BY-DATE" \
 *     "22/03/2026" \
 *     "WNsdw7QThbXtNcWGo33YB4P9p2V2"
 */
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const COLLECTION_PATH      = process.argv[3];
const DATE_ARG             = process.argv[4];
const URID_ARG             = process.argv[5] || null;

if (!SERVICE_ACCOUNT_PATH || !COLLECTION_PATH || !DATE_ARG) {
  console.error('Usage: node query-by-date.js <service-account.json> <collectionPath> <date DD/MM/YYYY> [urid]');
  process.exit(1);
}

// Parse DD/MM/YYYY → midnight Timestamp
function parseDate(str) {
  const [day, month, year] = str.split('/').map(Number);
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  return admin.firestore.Timestamp.fromDate(d);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function getCollectionRef(path) {
  const parts = path.split('/').filter(p => p.length > 0);
  let ref = db;
  for (let i = 0; i < parts.length; i++) {
    ref = i % 2 === 0 ? ref.collection(parts[i]) : ref.doc(parts[i]);
  }
  return ref;
}

async function main() {
  const dateTs = parseDate(DATE_ARG);

  console.log('====================================================');
  console.log('  Firestore Query by Date');
  console.log('====================================================');
  console.log('  Collection :', COLLECTION_PATH);
  console.log('  Date       :', DATE_ARG, '→', dateTs.toDate().toISOString());
  if (URID_ARG) console.log('  URID       :', URID_ARG);
  console.log('----------------------------------------------------');

  const colRef = getCollectionRef(COLLECTION_PATH);

  let query = colRef.where('date', '==', dateTs);
  if (URID_ARG) query = query.where('urid', '==', URID_ARG);

  const snap = await query.get();

  if (snap.empty) {
    console.log('  ⚠️  No documents found for this date.');
    process.exit(0);
  }

  console.log(`  Found: ${snap.size} document(s)\n`);

  snap.docs.forEach((doc, i) => {
    const data = doc.data();
    console.log(`  [${i + 1}] Document ID: ${doc.id}`);
    Object.keys(data).forEach(key => {
      const val = data[key];
      const display = val && val._seconds !== undefined
        ? new Date(val._seconds * 1000).toLocaleDateString('el-GR')
        : JSON.stringify(val);
      console.log(`       ${key}: ${display}`);
    });
    console.log('');
  });

  console.log('====================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('  ❌ Error:', err.message);
  process.exit(1);
});

