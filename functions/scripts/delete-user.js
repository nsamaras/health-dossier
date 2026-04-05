/**
 * Delete User Script
 *
 * Deletes a user completely from:
 *   - Firebase Authentication
 *   - Firestore collections (urid = document ID):
 *       users, temperatures, cleaning, allergenic-data, suppliers
 *   - Firestore collections (urid = field value):
 *       uploads, SUPPLIERS (collectionGroup)
 *
 * Usage:
 *   node delete-user.js <service-account.json> <urid> [--dry-run]
 *
 * Examples:
 *   node delete-user.js ./health-dossier-9c4e24879fde.json abc123xyz
 *   node delete-user.js ./health-dossier-9c4e24879fde.json abc123xyz --dry-run
 */

const admin  = require('firebase-admin');

// ── Args ──────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = process.argv[2];
const URID    = process.argv[3];
const DRY_RUN = process.argv.includes('--dry-run');

if (!SERVICE_ACCOUNT_PATH || !URID) {
  console.error('Usage: node delete-user.js <service-account.json> <urid> [--dry-run]');
  process.exit(1);
}

// ── Init ──────────────────────────────────────────────────────────────────────
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db   = admin.firestore();
const auth = admin.auth();

// ── Collections where urid IS the document ID ─────────────────────────────
const COLLECTIONS = ['users', 'temperatures', 'cleaning', 'allergenic-data', 'suppliers'];

// ── Collections where urid is a FIELD VALUE ───────────────────────────────
const FIELD_COLLECTIONS = [
  { collection: 'uploads',   isGroup: false },
  { collection: 'SUPPLIERS', isGroup: true  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('─'.repeat(60));
  console.log('  delete-user');
  console.log('  urid : ' + URID);
  if (DRY_RUN) console.log('  MODE : DRY RUN — no data will be deleted');
  console.log('─'.repeat(60));

  // ── 1. Resolve user info from Auth ─────────────────────────────────────────
  console.log('\n[1/3] Looking up user in Firebase Authentication…');
  let authUser = null;
  try {
    authUser = await auth.getUser(URID);
    console.log('      Found: ' + (authUser.email || authUser.displayName || URID));
  } catch (e) {
    console.warn('      ⚠  User not found in Authentication (' + e.code + ')');
  }

  // ── 2. Resolve user info from Firestore users collection ───────────────────
  console.log('\n[2/3] Looking up user in Firestore users collection…');
  const userDocRef  = db.collection('users').doc(URID);
  const userDocSnap = await userDocRef.get();
  if (userDocSnap.exists) {
    const d = userDocSnap.data();
    console.log('      Found: ' + (d.name || d.email || URID));
  } else {
    console.warn('      ⚠  No document found in users/' + URID);
  }

  if (!authUser && !userDocSnap.exists) {
    console.error('\n  ✘  No user found with urid "' + URID + '" — aborting.');
    process.exit(1);
  }

  // ── 3. Delete ──────────────────────────────────────────────────────────────
  console.log('\n[3/3] Deleting…\n');

  // 3a. Firebase Authentication
  if (authUser) {
    if (DRY_RUN) {
      console.log('  ✎  Would delete from Firebase Authentication');
    } else {
      try {
        await auth.deleteUser(URID);
        console.log('  ✔  Deleted from Firebase Authentication');
      } catch (e) {
        console.error('  ✘  Failed to delete from Authentication: ' + e.message);
      }
    }
  } else {
    console.log('  ↷  Skipped Authentication (user not found there)');
  }

  // 3b. Firestore — urid as document ID (recursive delete)
  for (const col of COLLECTIONS) {
    const ref = db.collection(col).doc(URID);
    if (DRY_RUN) {
      console.log('  ✎  Would recursively delete ' + col + '/' + URID + ' (and all subcollections)');
    } else {
      try {
        await db.recursiveDelete(ref);
        console.log('  ✔  Recursively deleted ' + col + '/' + URID);
      } catch (e) {
        console.error('  ✘  Failed to delete ' + col + '/' + URID + ': ' + e.message);
      }
    }
  }

  // 3c. Firestore — urid as field value (query + batch delete)
  for (const { collection, isGroup } of FIELD_COLLECTIONS) {
    const query = isGroup
      ? db.collectionGroup(collection).where('urid', '==', URID)
      : db.collection(collection).where('urid', '==', URID);

    const snapshot = await query.get();
    if (snapshot.empty) {
      console.log('  ↷  No documents in ' + collection + ' for this urid');
      continue;
    }
    if (DRY_RUN) {
      console.log('  ✎  Would delete ' + snapshot.size + ' document(s) from ' + collection + ' (field query)');
      snapshot.forEach(doc => console.log('       ' + doc.ref.path));
    } else {
      try {
        const BATCH_SIZE = 400;
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
          const batch = db.batch();
          docs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
        console.log('  ✔  Deleted ' + snapshot.size + ' document(s) from ' + collection);
      } catch (e) {
        console.error('  ✘  Failed to delete from ' + collection + ': ' + e.message);
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  if (DRY_RUN) {
    console.log('  ⚡ Dry-run complete — no data was deleted.');
  } else {
    console.log('  ✔  User "' + URID + '" deleted successfully.');
  }
  console.log('─'.repeat(60));
}

run()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\nFatal error:', err);
    process.exit(1);
  });
