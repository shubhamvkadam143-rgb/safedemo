const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const otpSessions = new Map();
const history = [];

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

const validIndianPhone = (phone) => /^\+91[6-9]\d{9}$/.test(String(phone || ''));

app.get('/api/health', (req, res) => res.json({ success: true, project: 'SafeHaven Mesh', mode: 'DEMO', realSMS: false }));

app.post('/api/demo/otp/send', (req, res) => {
  const { phone } = req.body || {};
  if (!validIndianPhone(phone)) return res.status(400).json({ success: false, message: 'Enter a valid number in +91XXXXXXXXXX format.' });
  const otp = String(crypto.randomInt(100000, 1000000));
  otpSessions.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
  res.json({ success: true, mode: 'DEMO', actualSMS: false, demoOTP: otp, message: 'Demo OTP generated. No SMS was sent.' });
});

app.post('/api/demo/otp/verify', (req, res) => {
  const { phone, otp } = req.body || {};
  const saved = otpSessions.get(phone);
  if (!saved || Date.now() > saved.expiresAt || saved.attempts >= 5) {
    otpSessions.delete(phone);
    return res.status(400).json({ success: false, verified: false, message: 'OTP expired. Generate a new demo OTP.' });
  }
  saved.attempts += 1;
  if (String(otp) !== saved.otp) return res.status(400).json({ success: false, verified: false, message: 'Incorrect OTP.' });
  otpSessions.delete(phone);
  res.json({ success: true, verified: true, mode: 'DEMO', message: 'Demo mobile verification successful. No SMS was sent.' });
});

app.post('/api/demo/sos', (req, res) => {
  const { contacts, latitude, longitude, note } = req.body || {};
  const lat = Number(latitude), lng = Number(longitude);
  if (!Array.isArray(contacts) || contacts.length < 1 || contacts.length > 5 || !contacts.every(validIndianPhone)) {
    return res.status(400).json({ success: false, message: 'Add 1 to 5 valid +91 emergency contact numbers.' });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ success: false, message: 'Valid location is required. Allow location permission.' });
  }
  const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
  const message = `DEMO SOS ALERT: A SafeHaven Mesh user needs help. ${note ? note + ' ' : ''}Location: ${mapLink}`;
  const uniqueContacts = [...new Set(contacts)];
  const records = uniqueContacts.map(phone => {
    const record = { id: crypto.randomUUID(), phone, message, mapLink, status: 'DEMO_ONLY_NOT_SENT', actualSMS: false, createdAt: new Date().toISOString() };
    history.unshift(record);
    return record;
  });
  res.json({ success: true, mode: 'DEMO', actualSMS: false, message: 'Demo alerts created. No real SMS was sent.', records });
});

app.get('/api/demo/history', (req, res) => res.json({ success: true, mode: 'DEMO', history: history.slice(0, 50) }));

app.listen(PORT, () => console.log(`SafeHaven Mesh Demo running at http://localhost:${PORT}`));
