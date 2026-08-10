import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
app.get('/api/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});

// Properties
app.get('/api/properties', async (req, res) => {
  const properties = await prisma.property.findMany();
  res.json(properties.map(p => ({
    ...p,
    amenities: p.amenities ? JSON.parse(p.amenities) : []
  })));
});
app.get('/api/properties/:id', async (req, res) => {
  const p = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (p) {
    res.json({ ...p, amenities: p.amenities ? JSON.parse(p.amenities) : [] });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.put('/api/properties/:id/status', async (req, res) => {
  const { status } = req.body;
  const updated = await prisma.property.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json({ ...updated, amenities: updated.amenities ? JSON.parse(updated.amenities) : [] });
});

// Bookings
app.get('/api/bookings', async (req, res) => {
  const bookings = await prisma.booking.findMany();
  res.json(bookings);
});
app.put('/api/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json(updated);
});

// Payments
app.get('/api/payments', async (req, res) => {
  const payments = await prisma.payment.findMany();
  res.json(payments);
});

// Auth (Simple mock with db check)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) {
    res.json({ user: admin, token: 'mock-jwt-token-stayzen-admin-xyz' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// System Health
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'StayZen Admin API is running'
  });
});
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StayZen Admin API is running'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
