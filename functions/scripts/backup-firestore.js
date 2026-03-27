/**
 * Manual Firestore Backup Script
 *
 * Exports the entire Firestore database to Google Cloud Storage.
 * Requires @google-cloud/firestore and a service account with:
 *   - roles/datastore.importExportAdmin
 *   - roles/storage.admin  (on the backup bucket)
 *
 * Usage:
 *   node backup-firestore.js <service-account.json> [YYYY-MM-DD]
 *
 * Examples:
 *   node backup-firestore.js ./health-dossier-9c4e24879fde.json
 *   node backup-firestore.js ./health-dossier-9c4e24879fde.json 2026-03-26
 */

const { v1 }  = require('@google-cloud/firestore');
const path    = require('path');

const SERVICE_ACCOUNT_PATH = process.argv[2];
const DATE_ARG             = process.argv[3] || new Date().toISOString().split('T')[0];

if (!SERVICE_ACCOUNT_PATH) {
  console.error('Usage: node backup-firestore.js <service-account.json> [YYYY-MM-DD]');
  process.exit(1);
}

const keyFile   = path.resolve(SERVICE_ACCOUNT_PATH);
const sa        = require(keyFile);
const projectId = sa.project_id;

const BACKUP_BUCKET = `gs://${projectId}-backups`;
const outputUri     = `${BACKUP_BUCKET}/firestore/${DATE_ARG}`;

const client = new v1.FirestoreAdminClient({ keyFilename: keyFile });

async function main() {
  console.log('====================================================');
  console.log('  Firestore Manual Backup');
  console.log('====================================================');
  console.log('  Project : ' + projectId);
  console.log('  Date    : ' + DATE_ARG);
  console.log('  Dest    : ' + outputUri);
  console.log('----------------------------------------------------');

  const databaseName = client.databasePath(projectId, '(default)');

  try {
    const [operation] = await client.exportDocuments({
      name           : databaseName,
      outputUriPrefix: outputUri,
      collectionIds  : [],   // empty = ALL collections
    });

    console.log('\n✅ Export operation started successfully!');
    console.log('   Operation : ' + operation.name);
    console.log('\n   The export runs asynchronously in the background.');
    console.log('   Check progress at:');
    console.log('   https://console.cloud.google.com/storage/browser/' + projectId + '-backups/firestore/' + DATE_ARG);
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Export failed:', err.message || err);
    if (err.message?.includes('PERMISSION_DENIED')) {
      console.error('\n   ⚠️  Make sure the service account has:');
      console.error('      - roles/datastore.importExportAdmin');
      console.error('      - roles/storage.admin on bucket: ' + BACKUP_BUCKET);
    }
    process.exit(1);
  }
}

main();

