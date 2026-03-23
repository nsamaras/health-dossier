/**
 * Health Dossier - Firebase Cloud Functions
 *
 * dailyTemperatureFill
 *   Runs every day at 22:00 (Europe/Athens = UTC+2).
 *   For every user in the `temperatures` collection it:
 *     1. Reads their profile lists (FRIDGES-LIST, FREEZERS-LIST, HOTS-LIST, COOKED-LIST)
 *     2. Creates a record for today if one does not exist yet
 *     3. Fills empty temperature fields with realistic random values:
 *          Fridges   :  0.0 –  6.0 °C  (temperatureMorning + temperatureAfternoon)
 *          Freezers  : -25.0 – -18.0 °C (temperatureMorning + temperatureAfternoon)
 *          Hots      : 63.0 –  85.0 °C  (temperature)
 *          Cooked    : 70.0 –  82.0 °C  (temperature)
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger }     = require('firebase-functions');
const admin          = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

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

