/**
 * Delete Uploads by URID
 *
 * Searches the /uploads collection for documents whose `urid` field
 * matches the provided value, then deletes them.
 *
 * Structure example:
 *   /uploads/OKHyOUMGDWxxTNGQpzV0
 *     -> urid: "K2haEZNOy5hKQO09f6s93WmIjvX2"
 *
 * Usage:
 *   node delete-uploads-by-urid.js <service-account.json> <urid> [--dry-run]
 *
 * Examples:
 *   # Dry-run — shows what would be deleted without touching anything
 *   node delete-uploads-by-urid.js ./health-dossier-9c4e24879fde.json K2haEZNOy5hKQO09f6s93WmIjvX2 --dry-run
 *
 *   # Actually delete
 *   node delete-uploads-by-urid.js ./health-dossier-9c4e24879fde.json K2haEZNOy5hKQO09f6s93WmIjvX2
 */

const admin = require('firebase-admin');

// ── Args ──────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = process.argv[2];
const URID    = process.argv[3];
const DRY_RUN = process.argv.includes('--dry-run');

if (!SERVICE_ACCOUNT_PATH || !URID) {
  console.error('Usage: node delete-uploads-by-urid.js <service-account.json> <urid> [--dry-run]');
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
  console.log('  delete-uploads-by-urid');
  console.log('  urid : ' + URID);
  if (DRY_RUN) console.log('  MODE : DRY RUN — no data will be deleted');
  console.log('─'.repeat(70));

  // ── Query uploads where urid matches ─────────────────────────────────────
  console.log('\n[1/2] Searching uploads where urid == "' + URID + '"…\n');

  const snapshot = await db
    .collection('uploads')
    .where('urid', '==', URID)
    .get();

  if (snapshot.empty) {
    console.log('  No upload documents found for urid "' + URID + '".');
    console.log('─'.repeat(70));
    return;
  }

  console.log('  Found ' + snapshot.size + ' document(s):\n');

  // ── Display results ────────────────────────────────────────────────────────
  snapshot.forEach(doc => {
    const d    = doc.data();
    const path = doc.ref.path;
    console.log('  📄 ' + path);
    if (d.name)        console.log('     name        : ' + d.name);
    if (d.fileName)    console.log('     fileName    : ' + d.fileName);
    if (d.fileUrl)     console.log('     fileUrl     : ' + d.fileUrl);
    if (d.fileType)    console.log('     fileType    : ' + d.fileType);
    if (d.category)    console.log('     category    : ' + d.category);
    if (d.description) console.log('     description : ' + d.description);
    if (d.createdAt)   console.log('     createdAt   : ' + formatDate(d.createdAt));
    if (d.date)        console.log('     date        : ' + formatDate(d.date));
    console.log('');
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  console.log('─'.repeat(70));
  if (DRY_RUN) {
    console.log('  DRY RUN — would delete ' + snapshot.size + ' document(s) listed above.');
    console.log('  Re-run without --dry-run to permanently delete them.');
  } else {
    console.log('\n[2/2] Deleting ' + snapshot.size + ' document(s)…\n');

    // Firestore batches are limited to 500 operations each
    const BATCH_SIZE = 400;
    const docs       = snapshot.docs;
    let   deleted    = 0;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + BATCH_SIZE);
      chunk.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      deleted += chunk.length;
      console.log('  ✔  Deleted batch: ' + deleted + ' / ' + docs.length);
    }

    console.log('\n  ✔  Successfully deleted ' + deleted + ' upload document(s) for urid "' + URID + '".');
  }

  console.log('─'.repeat(70));
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });

