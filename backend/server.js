const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock user data
const users = new Map();

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      token: 'mock-jwt-' + Date.now(),
      user: { id: 1, name: email.split('@')[0], email }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/register', (req, res) => {
  const { name, phone } = req.body;
  if (name && phone) {
    users.set(phone, { name, phone });
    res.json({ message: 'User registered successfully' });
  } else {
    res.status(400).json({ error: 'Name and phone required' });
  }
});

app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  // In real app, send actual OTP
  res.json({ success: true, message: 'OTP sent' });
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otp === '123456') {
    res.json({
      token: 'mock-jwt-token',
      user: { id: 1, name: 'Demo Rider', contact: phone }
    });
  } else {
    res.status(401).json({ error: 'Invalid OTP' });
  }
});

// Insurance endpoints
app.get('/api/plans', (req, res) => {
  res.json([
    { id: 1, name: 'Starter Shield', premium: 20, coverage: 1000 },
    { id: 2, name: 'Pro Shield', premium: 25, coverage: 1200 },
    { id: 3, name: 'Max Shield', premium: 35, coverage: 1500 }
  ]);
});

app.post('/api/activate-plan', (req, res) => {
  res.json({
    success: true,
    message: 'Plan activated',
    activePlan: req.body,
    activatedAt: new Date().toISOString()
  });
});

app.get('/api/payouts', (req, res) => {
  res.json([
    { id: 1, date: '2026-03-10', reason: 'Heavy Rain Detected', amount: 300 },
    { id: 2, date: '2026-03-18', reason: 'High AQI Exposure', amount: 240 }
  ]);
});

app.post('/api/payment', (req, res) => {
  res.json({
    success: true,
    paymentId: 'PAY-' + Date.now(),
    status: 'SUCCESS'
  });
});

app.listen(8080, () => {
  console.log('🚀 Mock backend running on http://localhost:8080');
});