/**
 * Query Cleaning Data by URID
 *
 * Searches ALL /cleaning/{any}/DATA subcollections for documents
 * whose `urid` field matches the provided value.
 *
 * Usage:
 *   node query-cleaning-by-urid.js <service-account.json> <urid> [--delete] [--dry-run]
 *
 * Examples:
 *   # List all cleaning docs for a user (read-only)
 *   node query-cleaning-by-urid.js ./health-dossier-9c4e24879fde.json DbOrapNllQU8V0aftpDOVLM4UDA3
 *
 *   # See what would be deleted without actually deleting
 *   node query-cleaning-by-urid.js ./health-dossier-9c4e24879fde.json DbOrapNllQU8V0aftpDOVLM4UDA3 --delete --dry-run
 *
 *   # Delete all matching documents
 *   node query-cleaning-by-urid.js ./health-dossier-9c4e24879fde.json DbOrapNllQU8V0aftpDOVLM4UDA3 --delete
 */

const admin = require('firebase-admin');

// ── Args ──────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = process.argv[2];
const URID    = process.argv[3];
const DELETE  = process.argv.includes('--delete');
const DRY_RUN = process.argv.includes('--dry-run');

if (!SERVICE_ACCOUNT_PATH || !URID) {
  console.error('Usage: node query-cleaning-by-urid.js <service-account.json> <urid> [--delete] [--dry-run]');
  process.exit(1);
}

// ── Init ──────────────────────────────────────────────────────────────────────
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '—';
  try { return ts.toDate().toISOString().split('T')[0]; } catch { return String(ts); }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('─'.repeat(70));
  console.log('  query-cleaning-by-urid');
  console.log('  urid   : ' + URID);
  console.log('  action : ' + (DELETE ? (DRY_RUN ? 'DELETE (dry-run)' : 'DELETE') : 'QUERY ONLY'));
  console.log('─'.repeat(70));

  // ── Query all DATA subcollections for this urid ────────────────────────────
  console.log('\nSearching collectionGroup("DATA") where urid == "' + URID + '"…\n');

  const snapshot = await db
    .collectionGroup('DATA')
    .where('urid', '==', URID)
    .get();

  if (snapshot.empty) {
    console.log('  No documents found for urid "' + URID + '".');
    console.log('─'.repeat(70));
    return;
  }

  console.log('  Found ' + snapshot.size + ' document(s):\n');

  // ── Display results ────────────────────────────────────────────────────────
  snapshot.forEach(doc => {
    const d    = doc.data();
    const path = doc.ref.path;
    console.log('  📄 ' + path);
    console.log('     name     : ' + (d.name     || '—'));
    console.log('     category : ' + (d.category || '—'));
    console.log('     date     : ' + formatDate(d.date));
    if (d.checked !== undefined) console.log('     checked  : ' + d.checked);
    console.log('');
  });

  // ── Delete if requested ────────────────────────────────────────────────────
  if (!DELETE) {
    console.log('─'.repeat(70));
    console.log('  ℹ  Read-only mode. Pass --delete to remove these documents.');
    console.log('─'.repeat(70));
    return;
  }

  console.log('─'.repeat(70));
  if (DRY_RUN) {
    console.log('  DRY RUN — the following ' + snapshot.size + ' document(s) would be deleted:\n');
    snapshot.forEach(doc => console.log('  ✎  ' + doc.ref.path));
  } else {
    console.log('  Deleting ' + snapshot.size + ' document(s)…\n');

    // Batch deletes (max 500 per batch)
    const BATCH_SIZE = 490;
    let batch = db.batch();
    let count = 0;
    let total = 0;

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      total++;

      if (count >= BATCH_SIZE) {
        await batch.commit();
        console.log('  ✔  Committed batch of ' + count + ' deletes');
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    console.log('\n  ✔  Deleted ' + total + ' document(s) from cleaning/DATA.');
  }

  console.log('─'.repeat(70));
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });

