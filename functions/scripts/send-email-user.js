/**
 * Send Email to a user by name or email
 * Looks up email from Firestore users collection
 *
 * Usage:
 *   node send-email-user.js <userName|email> <subject> <message>
 *
 * Examples:
 *   node send-email-user.js student "Καλησπέρα" "Μήνυμα από Health Dossier"
 *   node send-email-user.js student@student.gr "Υπενθύμιση" "Παρακαλώ καταχωρίστε τις θερμοκρασίες σας."
 */
require('dotenv').config({ path: '../.env' });
const admin      = require('firebase-admin');
const nodemailer = require('nodemailer');

const USER_ARG = process.argv[2];
const SUBJECT  = process.argv[3];
const MESSAGE  = process.argv[4];

if (!USER_ARG || !SUBJECT || !MESSAGE) {
  console.error('Usage: node send-email-user.js <userName|email> <subject> <message>');
  process.exit(1);
}

const serviceAccount = require('./health-dossier-9c4e24879fde.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  console.log('====================================================');
  console.log('  Email Sender');
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

  console.log('  Found   :', userDoc.name, '(' + userDoc.email + ')');

  if (!userDoc.email) {
    console.error('  ❌ User "' + userDoc.name + '" has no email in Firestore.');
    process.exit(1);
  }

  console.log('  To      :', userDoc.email);
  console.log('  Subject :', SUBJECT);
  console.log('  Message :', MESSAGE);
  console.log('----------------------------------------------------');

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.error('  ❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const result = await transporter.sendMail({
    from    : '"Health Dossier" <' + gmailUser + '>',
    to      : userDoc.email,
    subject : SUBJECT,
    text    : MESSAGE,
    html    : `<div style="font-family: Arial, sans-serif; padding: 20px;">
                 <h2 style="color: #1976d2;">Health Dossier</h2>
                 <p>${MESSAGE}</p>
                 <hr/>
                 <small style="color: #999;">Αυτό το μήνυμα στάλθηκε αυτόματα από το Health Dossier.</small>
               </div>`,
  });

  console.log('  ✅ Sent! Message ID:', result.messageId);
  console.log('====================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('  ❌ Error:', err.message);
  process.exit(1);
});

