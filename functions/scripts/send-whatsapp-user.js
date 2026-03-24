/**
 * Send WhatsApp message to a user by name
 * Looks up phoneNumber from Firestore users collection
 *
 * Usage:
 *   node send-whatsapp-user.js <userName> [message]
 *
 * Examples:
 *   node send-whatsapp-user.js student
 *   node send-whatsapp-user.js student "Γεια σου! Νέο μήνυμα από Health Dossier 🌡️"
 */
require('dotenv').config({ path: '../.env' });
const admin  = require('firebase-admin');
const twilio = require('twilio');

const USER_ARG = process.argv[2];
const MESSAGE  = process.argv[3] || 'Hello';

if (!USER_ARG) {
  console.error('Usage: node send-whatsapp-user.js <userName> [message]');
  process.exit(1);
}

const serviceAccount = require('./health-dossier-9c4e24879fde.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  console.log('====================================================');
  console.log('  WhatsApp Message Sender');
  console.log('====================================================');
  console.log('  Looking up user:', USER_ARG);

  // Find user in Firestore by name or email
  let userDoc = null;
  const isEmail = USER_ARG.includes('@');
  const field   = isEmail ? 'email' : 'name';

  let snap = await db.collection('users').where(field, '==', USER_ARG).get();
  if (snap.empty) {
    const lower   = USER_ARG.toLowerCase();
    const allSnap = await db.collection('users').get();
    const match   = allSnap.docs.find(d => (d.data()[field] || '').toLowerCase() === lower);
    if (match) userDoc = match.data();
  } else {
    userDoc = snap.docs[0].data();
  }

  if (!userDoc) {
    console.error('  ❌ User "' + USER_ARG + '" not found in Firestore.');
    process.exit(1);
  }

  console.log('  Found    :', userDoc.name, '(' + userDoc.email + ')');

  if (!userDoc.phoneNumber) {
    console.error('  ❌ User "' + userDoc.name + '" has no phoneNumber in Firestore.');
    process.exit(1);
  }

  console.log('  Phone    :', userDoc.phoneNumber);
  console.log('  Message  :', MESSAGE);
  console.log('----------------------------------------------------');

  const sid    = process.env.TWILIO_ACCOUNT_SID;
  const token  = process.env.TWILIO_AUTH_TOKEN;
  const from   = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    console.error('  ❌ Missing Twilio credentials in .env');
    process.exit(1);
  }

  const client = twilio(sid, token);
  const result = await client.messages.create({
    from : 'whatsapp:' + from,
    to   : 'whatsapp:' + userDoc.phoneNumber,
    body : MESSAGE,
  });

  console.log('  ✅ Sent! SID:', result.sid);
  console.log('  Status     :', result.status);
  console.log('====================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('  ❌ Error:', err.message);
  process.exit(1);
});

