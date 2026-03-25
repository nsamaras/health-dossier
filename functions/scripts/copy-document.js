/**
 * Copy Firestore Document Script
 *
 * Copies all fields from one Firestore document to another.
 *
 * Usage:
 *   node copy-document.js <service-account.json> <sourcePath> <destPath> [--merge]
 *
 * Arguments:
 *   sourcePath  : Full Firestore path to the source document (e.g. temperatures/userId/FRIDGES-LIST/docId)
 *   destPath    : Full Firestore path to the destination document
 *   --merge     : Optional. If set, merges fields instead of overwriting the entire destination document
 *
 * Examples:
 *   # Copy (overwrite)
 *   node copy-document.js ./health-dossier-9c4e24879fde.json "users/abc123" "users/xyz789"
 *
 *   # Copy and merge (keep existing fields in destination)
 *   node copy-document.js ./health-dossier-9c4e24879fde.json "users/abc123" "users/xyz789" --merge
 *
 *   # Copy a subcollection document
 *   node copy-document.js ./health-dossier-9c4e24879fde.json \
 *     "temperatures/userId1/FRIDGES-LIST/docId" \
 *     "temperatures/userId2/FRIDGES-LIST/docId"
 */
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const SOURCE_PATH          = process.argv[3];
const DEST_PATH            = process.argv[4];
const MERGE                = process.argv.includes('--merge');

if (!SERVICE_ACCOUNT_PATH || !SOURCE_PATH || !DEST_PATH) {
  console.error('Usage: node copy-document.js <service-account.json> <sourcePath> <destPath> [--merge]');
  console.error('Example: node copy-document.js ./health-dossier-9c4e24879fde.json "users/abc123" "users/xyz789"');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function getDocRef(path) {
  const parts = path.split('/').filter(p => p.length > 0);
  if (parts.length % 2 !== 0) {
    throw new Error(`Invalid document path: "${path}". Must have an even number of segments (collection/doc/collection/doc...)`);
  }
  let ref = db;
  for (let i = 0; i < parts.length; i++) {
    ref = i % 2 === 0 ? ref.collection(parts[i]) : ref.doc(parts[i]);
  }
  return ref;
}

async function main() {
  console.log('====================================================');
  console.log('  Firestore Document Copy Script');
  console.log('====================================================');
  console.log('  From  :', SOURCE_PATH);
  console.log('  To    :', DEST_PATH);
  console.log('  Mode  :', MERGE ? 'merge (keep existing dest fields)' : 'overwrite');
  console.log('----------------------------------------------------');

  const sourceRef = getDocRef(SOURCE_PATH);
  const destRef   = getDocRef(DEST_PATH);

  // Read source
  const sourceSnap = await sourceRef.get();
  if (!sourceSnap.exists) {
    console.error('  ❌ Source document not found:', SOURCE_PATH);
    process.exit(1);
  }

  const data = sourceSnap.data();
  console.log('  Fields found:', Object.keys(data).length);
  Object.keys(data).forEach(key => {
    const val = data[key];
    const display = val && val._seconds !== undefined
      ? `Timestamp(${new Date(val._seconds * 1000).toISOString().split('T')[0]})`
      : JSON.stringify(val);
    console.log('    ' + key + ': ' + display);
  });
  console.log('----------------------------------------------------');

  // Write to destination
  if (MERGE) {
    await destRef.set(data, { merge: true });
  } else {
    await destRef.set(data);
  }

  console.log('  ✅ Done! Document copied successfully.');
  console.log('====================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('  ❌ Error:', err.message);
  process.exit(1);
});

