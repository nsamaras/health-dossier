/**
 * Delete Cleaning by URID
 *
 * Deletes the document /cleaning/{urid} and ALL its subcollections (e.g. DATA).
 * It also dynamically discovers any additional subcollections under that path.
 *
 * Usage:
 *   node delete-cleaning-by-urid.js <service-account.json> <urid> [--dry-run]
 *
 * Examples:
 *   # Dry-run — shows what would be deleted without touching anything
 *   node delete-cleaning-by-urid.js ./health-dossier-9c4e24879fde.json K2haEZNOy5hKQO09f6s93WmIjvX2 --dry-run
 *
 *   # Actually delete
 *   node delete-cleaning-by-urid.js ./health-dossier-9c4e24879fde.json K2haEZNOy5hKQO09f6s93WmIjvX2
 */

const admin = require('firebase-admin');

// ── Args ──────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = process.argv[2];
const URID    = process.argv[3];
const DRY_RUN = process.argv.includes('--dry-run');

if (!SERVICE_ACCOUNT_PATH || !URID) {
  console.error('Usage: node delete-cleaning-by-urid.js <service-account.json> <urid> [--dry-run]');
  process.exit(1);
}

// ── Init ──────────────────────────────────────────────────────────────────────
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Known cleaning subcollections (DATA is the primary one) ──────────────────
const KNOWN_SUBCOLLECTIONS = ['DATA'];

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('─'.repeat(70));
  console.log('  delete-cleaning-by-urid');
  console.log('  urid : ' + URID);
  if (DRY_RUN) console.log('  MODE : DRY RUN — no data will be deleted');
  console.log('─'.repeat(70));

  // ── Verify the cleaning/{urid} document exists ────────────────────────────
  console.log('\n[1/3] Checking cleaning/' + URID + '…');
  const rootRef  = db.collection('cleaning').doc(URID);
  const rootSnap = await rootRef.get();

  if (!rootSnap.exists) {
    console.log('      ⚠  Document cleaning/' + URID + ' does not exist.');
    console.log('         Checking subcollections anyway…\n');
  } else {
    console.log('      ✔  Document found.');
  }

  // ── Discover all subcollections dynamically ───────────────────────────────
  console.log('\n[2/3] Discovering subcollections under cleaning/' + URID + '…\n');

  let subcollections = [...KNOWN_SUBCOLLECTIONS];
  try {
    const discovered = await rootRef.listCollections();
    const discoveredNames = discovered.map(c => c.id);
    // Merge discovered with known, avoiding duplicates
    for (const name of discoveredNames) {
      if (!subcollections.includes(name)) {
        subcollections.push(name);
      }
    }
    if (discoveredNames.length > 0) {
      console.log('  Found subcollections: ' + discoveredNames.join(', '));
    } else {
      console.log('  No subcollections found dynamically.');
    }
  } catch (e) {
    console.log('  Could not list subcollections dynamically: ' + e.message);
    console.log('  Falling back to known subcollections: ' + KNOWN_SUBCOLLECTIONS.join(', '));
  }

  // ── Count documents per subcollection ─────────────────────────────────────
  console.log('\n[3/3] Counting documents in each subcollection…\n');

  let grandTotal = 0;
  const counts   = {};

  for (const sub of subcollections) {
    const snap = await db
      .collection('cleaning').doc(URID)
      .collection(sub)
      .get();
    counts[sub] = snap.size;
    grandTotal += snap.size;
    if (snap.size > 0) {
      console.log('  ' + sub.padEnd(22) + ' : ' + snap.size + ' document(s)');
    }
  }

  if (grandTotal === 0 && !rootSnap.exists) {
    console.log('  No data found for urid "' + URID + '" — nothing to delete.');
    console.log('─'.repeat(70));
    return;
  }

  console.log('\n  Total documents : ' + grandTotal);
  if (rootSnap.exists) console.log('  Root document   : 1 (cleaning/' + URID + ')');
  console.log('');

  // ── Delete ────────────────────────────────────────────────────────────────
  console.log('─'.repeat(70));
  if (DRY_RUN) {
    console.log('  DRY RUN — would recursively delete cleaning/' + URID);
    console.log('  This includes the root document + all ' + grandTotal + ' subcollection document(s).');
    console.log('  Subcollections: ' + subcollections.filter(s => counts[s] > 0).join(', '));
  } else {
    console.log('  Deleting cleaning/' + URID + ' and all subcollections…');
    try {
      await db.recursiveDelete(rootRef);
      console.log('\n  ✔  Successfully deleted cleaning/' + URID);
      console.log('  ✔  Removed ' + grandTotal + ' document(s) across ' +
        subcollections.filter(s => counts[s] > 0).length + ' subcollection(s).');
    } catch (e) {
      console.error('\n  ✘  Delete failed: ' + e.message);
      process.exit(1);
    }
  }

  console.log('─'.repeat(70));
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });

