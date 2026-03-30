/**
 * Firestore Restore Script
 *
 * Imports a Firestore backup from Google Cloud Storage back into Firestore.
 * ⚠️  WARNING: This will OVERWRITE existing documents with the same IDs.
 *
 * Requires service account with:
 *   - roles/datastore.importExportAdmin
 *   - roles/storage.admin  (on the backup bucket)
 *
 * Usage:
 *   node restore-firestore.js <service-account.json> <YYYY-MM-DD>
 *
 * Examples:
 *   node restore-firestore.js ./health-dossier-9c4e24879fde.json 2026-03-26
 */

const { v1 }  = require('@google-cloud/firestore');
const path    = require('path');
const readline = require('readline');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const DATE_ARG             = process.argv[3];

if (!SERVICE_ACCOUNT_PATH || !DATE_ARG) {
  console.error('Usage: node restore-firestore.js <service-account.json> <YYYY-MM-DD>');
  process.exit(1);
}

const keyFile   = path.resolve(SERVICE_ACCOUNT_PATH);
const sa        = require(keyFile);
const projectId = sa.project_id;

const BACKUP_BUCKET = `gs://${projectId}-backups`;
const inputUri      = `${BACKUP_BUCKET}/firestore/${DATE_ARG}`;
const client        = new v1.FirestoreAdminClient({ keyFilename: keyFile });

function confirm(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

async function main() {
  console.log('====================================================');
  console.log('  ⚠️   Firestore RESTORE');
  console.log('====================================================');
  console.log('  Project : ' + projectId);
  console.log('  Source  : ' + inputUri);
  console.log('----------------------------------------------------');
  console.log('  WARNING: This will overwrite existing documents!');
  console.log('====================================================\n');

  const answer = await confirm('Type YES to confirm restore: ');
  if (answer !== 'yes') {
    console.log('Restore cancelled.');
    process.exit(0);
  }

  const databaseName = client.databasePath(projectId, '(default)');

  try {
    const [operation] = await client.importDocuments({
      name       : databaseName,
      inputUriPrefix: inputUri,
      collectionIds: [],   // empty = restore ALL collections
    });

    console.log('\n✅ Restore operation started successfully!');
    console.log('   Operation : ' + operation.name);
    console.log('\n   The import runs asynchronously in the background.');
    console.log('   Check Firebase Console → Firestore for progress.');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Restore failed:', err.message || err);
    if (err.message?.includes('NOT_FOUND')) {
      console.error('\n   ⚠️  No backup found at: ' + inputUri);
      console.error('      Check available backups at:');
      console.error('      https://console.cloud.google.com/storage/browser/' + projectId + '-backups/firestore');
    }
    process.exit(1);
  }
}

main();

