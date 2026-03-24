/**
 * Test WhatsApp message via Twilio (text + optional media/video)
 * Usage:
 *   node test-whatsapp.js <phone> <message> [mediaUrl]
 *
 * Examples:
 *   # Text only
 *   node test-whatsapp.js +309647224486 "Hello!"
 *   # With video / image
 *   node test-whatsapp.js +309647224486 "Watch this!" "https://example.com/video.mp4"
 */
require('dotenv').config({ path: '../.env' });
const twilio = require('twilio');

const to       = process.argv[2];
const message  = process.argv[3] || 'Hello from Health Dossier! 🌡️';
const mediaUrl = process.argv[4] || null;

if (!to) {
  console.error('Usage: node test-whatsapp.js <phone_number> <message> [mediaUrl]');
  process.exit(1);
}

const sid   = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from  = process.env.TWILIO_WHATSAPP_FROM;

if (!sid || !token || !from) {
  console.error('Missing Twilio credentials in .env');
  process.exit(1);
}

console.log('====================================================');
console.log('  Twilio WhatsApp Test');
console.log('====================================================');
console.log('  To      :', 'whatsapp:' + to);
console.log('  From    :', 'whatsapp:' + from);
console.log('  Message :', message);
if (mediaUrl) console.log('  Media   :', mediaUrl);
console.log('----------------------------------------------------');

const client  = twilio(sid, token);
const payload = {
  from : 'whatsapp:' + from,
  to   : 'whatsapp:' + to,
  body : message,
};
if (mediaUrl) payload.mediaUrl = [mediaUrl];

client.messages.create(payload)
  .then(msg => {
    console.log('  ✅ Sent! SID:', msg.sid);
    console.log('  Status     :', msg.status);
    console.log('====================================================');
    process.exit(0);
  })
  .catch(err => {
    console.error('  ❌ Failed:', err.message);
    console.log('====================================================');
    process.exit(1);
  });

