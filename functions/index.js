/**
 * Health Dossier - Firebase Cloud Functions
 *
 * dailyTemperatureFill
 *   Runs every day at 22:00 (Europe/Athens = UTC+2).
 *   For every user it reads their profile lists and fills empty temperature
 *   fields with random values matching the UI select options:
 *     Fridges  :  0 –  6 °C   (temperatureMorning + temperatureAfternoon)
 *     Freezers : -18 – -25 °C (temperatureMorning + temperatureAfternoon)
 *     Hots     : 63 –  85 °C  (temperature)
 *     Cooked   : 70 –  82 °C  (temperature)
 *
 * scheduledFirestoreBackup
 *   Runs every day at 03:00 (Europe/Athens).
 *   Exports the entire Firestore database to Google Cloud Storage bucket:
 *     gs://health-dossier-9c4e24879fde-backups/firestore/YYYY-MM-DD/
 */

const { onSchedule }   = require('firebase-functions/v2/scheduler');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger }       = require('firebase-functions');
const admin            = require('firebase-admin');
const twilio           = require('twilio');

admin.initializeApp();
const db = admin.firestore();

// ─── Twilio client (reads from .env / Firebase secret env vars) ───────────
function getTwilioClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('Twilio credentials not configured in .env');
  return twilio(sid, token);
}

// ─── Delete User ──────────────────────────────────────────────────────────
exports.deleteUser = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in.');

  const { urid } = request.data;
  if (!urid) throw new HttpsError('invalid-argument', 'urid is required.');

  // Only admins can delete users
  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!callerDoc.exists || !callerDoc.data().isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can delete users.');
  }

  // Prevent self-deletion
  if (request.auth.uid === urid) {
    throw new HttpsError('failed-precondition', 'Cannot delete your own account.');
  }

  // 1. Delete from Firebase Authentication
  try {
    await admin.auth().deleteUser(urid);
    logger.info('Auth user deleted: ' + urid);
  } catch (e) {
    logger.warn('Could not delete auth user ' + urid + ': ' + e.message);
  }

  // 2. Recursively delete from all Firestore collections where urid IS the document ID
  const COLLECTIONS = ['users', 'temperatures', 'cleaning', 'allergenic-data', 'suppliers'];
  for (const col of COLLECTIONS) {
    const ref = db.collection(col).doc(urid);
    try {
      await db.recursiveDelete(ref);
      logger.info('Deleted ' + col + '/' + urid);
    } catch (e) {
      logger.warn('Could not delete ' + col + '/' + urid + ': ' + e.message);
    }
  }

  // 3. Delete from collections where urid is a FIELD VALUE (not document ID)
  // uploads: /uploads/{docId}  ->  urid field
  // suppliers sub-documents: /suppliers/{any}/SUPPLIERS/{docId}  ->  urid field
  const FIELD_COLLECTIONS = [
    { collection: 'uploads',   isGroup: false },
    { collection: 'SUPPLIERS', isGroup: true  },
  ];

  for (const { collection, isGroup } of FIELD_COLLECTIONS) {
    try {
      const query = isGroup
        ? db.collectionGroup(collection).where('urid', '==', urid)
        : db.collection(collection).where('urid', '==', urid);

      const snapshot = await query.get();
      if (snapshot.empty) {
        logger.info('No documents found in ' + collection + ' for urid ' + urid);
        continue;
      }

      const BATCH_SIZE = 400;
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        docs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      logger.info('Deleted ' + docs.length + ' document(s) from ' + collection + ' for urid ' + urid);
    } catch (e) {
      logger.warn('Could not delete from ' + collection + ' (field query) for urid ' + urid + ': ' + e.message);
    }
  }

  logger.info('deleteUser complete for urid: ' + urid);
  return { success: true };
});

// ─── Send WhatsApp message (text + optional video/image) ─────────────────
exports.sendWhatsAppToUser = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in.');

  const { userNameOrUrid, message, mediaUrl } = request.data;
  if (!userNameOrUrid || !message) {
    throw new HttpsError('invalid-argument', 'userNameOrUrid and message are required.');
  }

  // Find user in Firestore
  let userDoc = null;
  const byUrid = await db.collection('users').where('urid', '==', userNameOrUrid).get();
  if (!byUrid.empty) {
    userDoc = byUrid.docs[0].data();
  } else {
    const byName = await db.collection('users')
      .where('name', '==', userNameOrUrid).get();
    if (!byName.empty) userDoc = byName.docs[0].data();
  }

  if (!userDoc) throw new HttpsError('not-found', `User "${userNameOrUrid}" not found.`);
  if (!userDoc.phoneNumber) {
    throw new HttpsError('failed-precondition', `User "${userDoc.name}" has no phone number.`);
  }

  const payload = {
    from : 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
    to   : 'whatsapp:' + userDoc.phoneNumber,
    body : message,
  };
  if (mediaUrl) payload.mediaUrl = [mediaUrl];

  const client = getTwilioClient();
  const result = await client.messages.create(payload);

  logger.info('WhatsApp sent to ' + userDoc.name + ' (' + userDoc.phoneNumber + ')' +
    (mediaUrl ? ' [+media]' : '') + ': ' + result.sid);
  return { success: true, sid: result.sid, to: userDoc.phoneNumber };
});

// ─── Temperature generators ────────────────────────────────────────────────
const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

const CATEGORIES = [
  {
    list    : 'FRIDGES-LIST',
    byDate  : 'FRIDGES-BY-DATE',
    slotBased: true,
    min     : 0,
    max     : 6,
  },
  {
    list    : 'FREEZERS-LIST',
    byDate  : 'FREEZERS-BY-DATE',
    slotBased: true,
    min     : -25,
    max     : -18,
  },
  {
    list    : 'HOTS-LIST',
    byDate  : 'HOTS-BY-DATE',
    slotBased: false,
    min     : 63,
    max     : 85,
  },
  {
    list    : 'COOKED-LIST',
    byDate  : 'COOKED-BY-DATE',
    slotBased: false,
    min     : 70,
    max     : 82,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
async function flushBatch(batch, count) {
  if (count > 0) await batch.commit();
  return { batch: db.batch(), count: 0 };
}

async function processUser(urid, todayTimestamp) {
  let total = 0;
  let { batch, count } = { batch: db.batch(), count: 0 };

  for (const cat of CATEGORIES) {
    // Load profile items (e.g. the list of named fridges)
    const profileSnap = await db
      .collection('temperatures').doc(urid).collection(cat.list).get();

    if (profileSnap.empty) continue;

    const profileItems = profileSnap.docs.map(d => d.data());

    // Find which profiles already have a record for today
    const existingSnap = await db
      .collection('temperatures').doc(urid).collection(cat.byDate)
      .where('date', '==', todayTimestamp).get();

    const recorded = new Set(existingSnap.docs.map(d => d.data().name));

    for (const item of profileItems) {
      const docId  = db.collection('_').doc().id;
      const docRef = db
        .collection('temperatures').doc(urid).collection(cat.byDate).doc(docId);

      if (recorded.has(item.name)) {
        // Record exists — fill any empty field
        const existing = existingSnap.docs.find(d => d.data().name === item.name);
        if (!existing) continue;
        const data    = existing.data();
        const updates = {};

        if (cat.slotBased) {
          if (data.temperatureMorning   === '' || data.temperatureMorning   == null)
            updates.temperatureMorning   = rand(cat.min, cat.max);
          if (data.temperatureAfternoon === '' || data.temperatureAfternoon == null)
            updates.temperatureAfternoon = rand(cat.min, cat.max);
        } else {
          if (data.temperature === '' || data.temperature == null)
            updates.temperature = rand(cat.min, cat.max);
        }

        if (Object.keys(updates).length > 0) {
          batch.update(existing.ref, updates);
          count++; total++;
        }
      } else {
        // No record for today — create one with values
        const record = {
          urid,
          name    : item.name,
          category: cat.byDate,
          docId,
          date    : todayTimestamp,
        };

        if (cat.slotBased) {
          record.temperatureMorning   = rand(cat.min, cat.max);
          record.temperatureAfternoon = rand(cat.min, cat.max);
        } else {
          record.temperature = rand(cat.min, cat.max);
        }

        batch.set(docRef, record);
        count++; total++;
      }

      if (count >= 490) {
        ({ batch, count } = await flushBatch(batch, count));
      }
    }
  }

  await flushBatch(batch, count);
  return total;
}

// ─── Scheduled Cloud Function ──────────────────────────────────────────────
exports.dailyTemperatureFill = onSchedule(
  {
    schedule : '0 22 * * *',       // every day at 22:00
    timeZone : 'Europe/Athens',    // UTC+2 (Greece)
    memory   : '256MiB',
    timeoutSeconds: 300,
  },
  async () => {
    logger.info('=== dailyTemperatureFill started ===');

    // Today at local midnight (Athens)
    const now       = new Date();
    const midnight  = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayTs   = admin.firestore.Timestamp.fromDate(midnight);

    logger.info('Processing date: ' + midnight.toISOString().split('T')[0]);

    // Get all users from the temperatures collection
    const userRefs = await db.collection('temperatures').listDocuments();
    if (userRefs.length === 0) {
      logger.info('No users found in temperatures collection.');
      return;
    }

    logger.info('Found ' + userRefs.length + ' user(s).');

    let grandTotal = 0;
    for (const ref of userRefs) {
      const urid   = ref.id;
      const created = await processUser(urid, todayTs);
      logger.info('User ' + urid + ' → ' + created + ' record(s) written');
      grandTotal += created;
    }

    logger.info('=== dailyTemperatureFill done. Total records: ' + grandTotal + ' ===');
  }
);

// ─── Scheduled Firestore Backup ────────────────────────────────────────────
const { v1 } = require('@google-cloud/firestore');
const firestoreAdminClient = new v1.FirestoreAdminClient();

const BACKUP_BUCKET = 'gs://health-dossier-9c4e24879fde-backups';

exports.scheduledFirestoreBackup = onSchedule(
  {
    schedule      : '0 3 * * *',      // every day at 03:00
    timeZone      : 'Europe/Athens',
    memory        : '256MiB',
    timeoutSeconds: 120,
  },
  async () => {
    const projectId    = process.env.GCLOUD_PROJECT || 'health-dossier-9c4e24879fde';
    const databaseName = firestoreAdminClient.databasePath(projectId, '(default)');
    const date         = new Date().toISOString().split('T')[0];   // YYYY-MM-DD
    const outputUri    = `${BACKUP_BUCKET}/firestore/${date}`;

    logger.info('=== scheduledFirestoreBackup started ===');
    logger.info('Exporting to: ' + outputUri);

    const [operation] = await firestoreAdminClient.exportDocuments({
      name           : databaseName,
      outputUriPrefix: outputUri,
      collectionIds  : [],           // empty = export ALL collections
    });

    logger.info('Export operation started: ' + operation.name);
    logger.info('=== scheduledFirestoreBackup scheduled — check GCS for results ===');
  }
);

