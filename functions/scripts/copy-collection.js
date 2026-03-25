/**
 * Copy Firestore Collection Script
 *
 * Copies all documents from one Firestore collection to another.
 *
 * Usage:
 *   node copy-collection.js <service-account.json> <sourcePath> <destPath> [--merge]
 *
 * Examples:
 *   node copy-collection.js ./health-dossier-9c4e24879fde.json \
 *     "temperatures/userId/FRIDGES" \
 *     "temperatures/userId/FRIDGES-LIST"
 *
 *   # Keep existing docs in destination (only add/update)
 *   node copy-collection.js ./health-dossier-9c4e24879fde.json \
 *     "temperatures/userId/FRIDGES" \
 *     "temperatures/userId/FRIDGES-LIST" --merge
 */
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const SOURCE_PATH          = process.argv[3];
const DEST_PATH            = process.argv[4];
const MERGE                = process.argv.includes('--merge');

if (!SERVICE_ACCOUNT_PATH || !SOURCE_PATH || !DEST_PATH) {
  console.error('Usage: node copy-collection.js <service-account.json> <sourcePath> <destPath> [--merge]');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function getCollectionRef(path) {
  const parts = path.split('/').filter(p => p.length > 0);
  if (parts.length % 2 === 0) {
    throw new Error(`"${path}" looks like a document path. Provide a collection path (odd number of segments).`);
  }
  let ref = db;
  for (let i = 0; i < parts.length; i++) {
    ref = i % 2 === 0 ? ref.collection(parts[i]) : ref.doc(parts[i]);
  }
  return ref;
}

async function main() {
  console.log('====================================================');
  console.log('  Firestore Collection Copy Script');
  console.log('====================================================');
  console.log('  From  :', SOURCE_PATH);
  console.log('  To    :', DEST_PATH);
  console.log('  Mode  :', MERGE ? 'merge' : 'overwrite');
  console.log('----------------------------------------------------');

  const sourceRef = getCollectionRef(SOURCE_PATH);
  const destRef   = getCollectionRef(DEST_PATH);

  const snap = await sourceRef.get();
  if (snap.empty) {
    console.log('  ⚠️  Source collection is empty. Nothing to copy.');
    process.exit(0);
  }

  console.log('  Documents found:', snap.size);
  console.log('----------------------------------------------------');

  let batch      = db.batch();
  let batchCount = 0;
  let total      = 0;

  for (const doc of snap.docs) {
    const data   = doc.data();
    const destDoc = destRef.doc(doc.id);

    console.log('  Copying:', doc.id);
    Object.keys(data).forEach(key => {
      const val = data[key];
      const display = val && val._seconds !== undefined
        ? `Timestamp(${new Date(val._seconds * 1000).toISOString().split('T')[0]})`
        : JSON.stringify(val);
      console.log('    ' + key + ': ' + display);
    });

    if (MERGE) {
      batch.set(destDoc, data, { merge: true });
    } else {
      batch.set(destDoc, data);
    }

    batchCount++;
    total++;

    if (batchCount >= 490) {
      await batch.commit();
      batch      = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) await batch.commit();

  console.log('----------------------------------------------------');
  console.log('  ✅ Done! Copied', total, 'document(s).');
  console.log('====================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('  ❌ Error:', err.message);
  process.exit(1);
});

