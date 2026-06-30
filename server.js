require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf8'));

app.get('/api/site', (req, res) => res.json(readJSON('site.json')));
app.get('/api/products', (req, res) => res.json(readJSON('products.json')));
app.get('/api/collections', (req, res) => res.json(readJSON('collections.json')));
app.get('/api/showroom', (req, res) => res.json(readJSON('showroom.json')));

function darajaBaseUrl() {
  return process.env.NODE_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('07') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
  return null;
}

async function getDarajaToken() {
  const key = process.env.DARAJA_CONSUMER_KEY;
  const secret = process.env.DARAJA_CONSUMER_SECRET;
  if (!key || !secret || key === 'your_consumer_key') {
    throw new Error('Daraja consumer key/secret are not configured. Copy .env.example to .env and add credentials.');
  }
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = `${darajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
  const response = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
  return response.data.access_token;
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function designSvg(type, width, depth, height) {
  const label = `${width}W x ${depth}D x ${height}H cm`;
  const title = type.replace('-', ' ').toUpperCase();
  const shapes = {
    sofa: '<rect x="75" y="145" width="250" height="90" rx="28"/><rect x="95" y="105" width="210" height="70" rx="24" opacity=".8"/><circle cx="108" cy="248" r="12"/><circle cx="292" cy="248" r="12"/>',
    bed: '<rect x="70" y="115" width="260" height="135" rx="24"/><rect x="70" y="78" width="260" height="48" rx="20" opacity=".8"/><rect x="92" y="138" width="94" height="52" rx="16" opacity=".28"/><rect x="204" y="138" width="94" height="52" rx="16" opacity=".28"/>',
    wardrobe: '<rect x="92" y="52" width="216" height="222" rx="20"/><line x1="200" y1="70" x2="200" y2="258" stroke="#F6EBD6" stroke-width="5" opacity=".7"/><circle cx="185" cy="160" r="5" fill="#F6EBD6"/><circle cx="216" cy="160" r="5" fill="#F6EBD6"/>',
    'tv-unit': '<rect x="56" y="92" width="288" height="98" rx="22" opacity=".3"/><rect x="78" y="200" width="244" height="62" rx="18"/><line x1="150" y1="205" x2="150" y2="255" stroke="#F6EBD6" stroke-width="4" opacity=".5"/><line x1="235" y1="205" x2="235" y2="255" stroke="#F6EBD6" stroke-width="4" opacity=".5"/>',
    dining: '<ellipse cx="200" cy="165" rx="118" ry="58"/><rect x="184" y="210" width="32" height="60" rx="12"/><circle cx="78" cy="165" r="28" opacity=".8"/><circle cx="322" cy="165" r="28" opacity=".8"/><circle cx="200" cy="83" r="28" opacity=".8"/><circle cx="200" cy="247" r="28" opacity=".8"/>',
    desk: '<rect x="70" y="130" width="260" height="42" rx="14"/><rect x="90" y="170" width="28" height="90" rx="12"/><rect x="282" y="170" width="28" height="90" rx="12"/><rect x="215" y="180" width="82" height="54" rx="12" opacity=".35"/>'
  };
  return `<svg viewBox="0 0 400 320" role="img" aria-label="${title} custom furniture preview" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="320" rx="34" fill="#0D3B2E"/><circle cx="68" cy="70" r="58" fill="#F6EBD6" opacity=".18"/><circle cx="340" cy="260" r="76" fill="#F6EBD6" opacity=".14"/><g fill="#F6EBD6">${shapes[type] || shapes.sofa}</g><text x="26" y="292" fill="#F6EBD6" font-family="Arial" font-size="16" font-weight="700">${label}</text></svg>`;
}

function generateCustomDesign(input) {
  const type = input.furnitureType || 'sofa';
  const roomWidth = Number(input.roomWidth) || 3;
  const roomLength = Number(input.roomLength) || 4;
  const style = input.style || 'Modern warm';
  const material = input.material || 'Hardwood + fabric';
  const storage = input.storage || 'Standard storage';
  const base = {
    sofa: { w: 220, d: 90, h: 82, budget: 52000, name: 'AI Sofa Concept' },
    bed: { w: 160, d: 205, h: 110, budget: 58000, name: 'AI Bed Concept' },
    wardrobe: { w: 180, d: 60, h: 230, budget: 76000, name: 'AI Wardrobe Concept' },
    'tv-unit': { w: 180, d: 38, h: 52, budget: 31000, name: 'AI TV Unit Concept' },
    dining: { w: 160, d: 90, h: 76, budget: 69000, name: 'AI Dining Concept' },
    desk: { w: 130, d: 60, h: 76, budget: 34000, name: 'AI Work Desk Concept' }
  }[type] || { w: 180, d: 80, h: 80, budget: 45000, name: 'AI Furniture Concept' };
  const usableW = Math.round(roomWidth * 100 * 0.72);
  const usableD = Math.round(roomLength * 100 * 0.42);
  const width = clamp(Math.round((base.w + usableW) / 2), 90, Math.max(110, usableW));
  const depth = clamp(Math.round((base.d + usableD) / 2), 35, Math.max(60, usableD));
  const height = base.h;
  const storageAdd = storage === 'Extra storage' ? 15000 : storage === 'No storage' ? -5000 : 0;
  const materialFactor = material.includes('Hardwood') ? 1.15 : material.includes('MDF') ? 0.9 : 1.0;
  const estimatedBudget = Math.max(12000, Math.round((base.budget + storageAdd) * materialFactor));
  return {
    title: `${base.name} for a ${roomWidth}m x ${roomLength}m room`,
    style,
    summary: `A ${style.toLowerCase()} ${type.replace('-', ' ')} planned for practical Kenyan homes, with ${material.toLowerCase()} and ${storage.toLowerCase()}.`,
    dimensions: { width, depth, height },
    estimatedBudget,
    svg: designSvg(type, width, depth, height),
    notes: [
      'Leave at least 60 cm walking space around the furniture where possible.',
      'Final measurements should be confirmed on site or through clear room photos.',
      'The workshop can adjust fabric, finish, drawers, shelves and handle style before production.'
    ]
  };
}

app.post('/api/ai/custom-design', (req, res) => {
  try {
    const design = generateCustomDesign(req.body || {});
    res.json({ ok: true, design });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const amount = Number(req.body.amount);
    const orderId = String(req.body.orderId || `KV-${Date.now()}`).slice(0, 12);

    if (!phone) return res.status(400).json({ ok: false, message: 'Use a valid Kenyan Safaricom number, e.g. 0712345678.' });
    if (!amount || amount < 1) return res.status(400).json({ ok: false, message: 'Amount must be at least KES 1.' });

    const token = await getDarajaToken();
    const shortcode = process.env.DARAJA_SHORTCODE || '174379';
    const passkey = process.env.DARAJA_PASSKEY;
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.DARAJA_CALLBACK_URL,
      AccountReference: orderId || process.env.DARAJA_ACCOUNT_REFERENCE || 'KivuliHomeworks',
      TransactionDesc: process.env.DARAJA_TRANSACTION_DESC || 'Furniture order payment'
    };

    const response = await axios.post(`${darajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({ ok: true, message: 'M-Pesa prompt sent. Enter your PIN on your phone.', data: response.data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.response?.data?.errorMessage || error.message, details: error.response?.data || null });
  }
});

app.post('/api/mpesa/callback', (req, res) => {
  const callbacksDir = path.join(__dirname, 'data', 'callbacks');
  fs.mkdirSync(callbacksDir, { recursive: true });
  fs.writeFileSync(path.join(callbacksDir, `${Date.now()}.json`), JSON.stringify(req.body, null, 2));
  res.json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });
});

const pages = ['/', '/collections', '/living-room', '/bedroom', '/dining', '/custom', '/showroom', '/checkout'];
pages.forEach(route => {
  app.get(route, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`Kivuli Homeworks running on http://localhost:${PORT}`));
