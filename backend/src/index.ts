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

import { execSync } from 'child_process';
import * as bcrypt from 'bcryptjs';

app.get('/api/seed-db', async (req, res) => {
  try {
    console.log('Running prisma db push...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('Clearing database...');
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
    await prisma.admin.deleteMany();

    console.log('Seeding Permissions...');
    const modules = ['Dashboard', 'Users', 'Properties', 'Bookings', 'Payments', 'Settings', 'Vendors', 'Reports', 'CMS', 'Notifications', 'System'];
    const actions = ['View', 'Edit', 'Create', 'Delete'];

    const allPermissions = [];
    for (const mod of modules) {
      for (const act of actions) {
        allPermissions.push(await prisma.permission.create({
          data: { module: mod, action: act }
        }));
      }
    }
    const fullAccess = await prisma.permission.create({ data: { module: 'System', action: '*' } });

    console.log('Seeding Roles...');
    const superAdminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        description: 'Full access to the entire system',
        permissions: {
          create: [...allPermissions.map(p => ({ permissionId: p.id })), { permissionId: fullAccess.id }]
        }
      }
    });

    const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Limited Admin with specific access',
        permissions: {
          create: allPermissions
            .filter(p => p.module === 'Users' || p.module === 'Reports')
            .map(p => ({ permissionId: p.id }))
        }
      }
    });

    const viewerRole = await prisma.role.create({
      data: {
        name: 'Viewer',
        description: 'Read-only access',
        permissions: {
          create: allPermissions
            .filter(p => p.action === 'View' && (p.module === 'Dashboard' || p.module === 'Reports'))
            .map(p => ({ permissionId: p.id }))
        }
      }
    });

    console.log('Seeding Admins...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const u1 = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: 'admin@stayzen.com',
        password: hashedPassword,
        status: 'Active',
        isApproved: true,
        roleId: superAdminRole.id
      }
    });
    
    await prisma.admin.create({
      data: {
        name: 'John Staff',
        email: 'john@stayzen.com',
        password: hashedPassword,
        status: 'Active',
        isApproved: true,
        roleId: adminRole.id
      }
    });

    res.json({ success: true, message: 'Database migrated and seeded perfectly!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

import { authenticate, authorize, AuthRequest } from './middleware/auth';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Admin Management
app.get('/api/admins', authenticate, authorize('Users', 'View'), async (req, res) => {
  const admins = await prisma.admin.findMany({
    include: { role: true }
  });
  res.json(admins.map(a => { const { password, ...rest } = a; return rest; }));
});

app.put('/api/admins/:id/status', authenticate, authorize('Users', 'Edit'), async (req, res) => {
  const { status, isApproved } = req.body;
  const admin = await prisma.admin.update({
    where: { id: req.params.id as string },
    data: { status, isApproved }
  });
  res.json(admin);
});

// Create Admin
app.post('/api/admins', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.name !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Admins can create new admins.' });
    }

    const { name, email, roleName = 'Staff' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: `Role '${roleName}' not found.` });
    }

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        roleId: role.id,
        status: 'Active',
        isApproved: true,
        // password is null by default
      }
    });

    res.status(201).json(newAdmin);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete Admin
app.delete('/api/admins/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role?.name !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Admins can delete admins.' });
    }

    const targetId = req.params.id;
    if (req.user.id === targetId) {
      return res.status(400).json({ error: 'You cannot delete yourself.' });
    }

    await prisma.admin.delete({
      where: { id: targetId as string }
    });

    res.json({ success: true, message: 'Admin deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Super Admin password assignment
app.put('/api/admins/:id/password', authenticate, async (req: AuthRequest, res) => {
  try {
    // Strictly verify Super Admin
    if (req.user?.role?.name !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Admins can set passwords for other users.' });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // We do NOT modify role, status, or permissions. Only the password.
    const updatedAdmin = await prisma.admin.update({
      where: { id: req.params.id as string },
      data: { password: hashedPassword }
    });
    
    res.json({ success: true, message: 'Password set successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Roles
app.get('/api/roles', authenticate, authorize('Users', 'View'), async (req, res) => {
  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } }
  });
  res.json(roles);
});

// Users
app.get('/api/users', authenticate, authorize('Users', 'View'), async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
app.get('/api/users/:id', authenticate, authorize('Users', 'View'), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});

// Properties
app.get('/api/properties', authenticate, authorize('Properties', 'View'), async (req, res) => {
  const properties = await prisma.property.findMany();
  res.json(properties.map(p => ({
    ...p,
    amenities: p.amenities ? JSON.parse(p.amenities) : []
  })));
});
app.get('/api/properties/:id', authenticate, authorize('Properties', 'View'), async (req, res) => {
  const p = await prisma.property.findUnique({ where: { id: req.params.id as string } });
  if (p) {
    res.json({ ...p, amenities: p.amenities ? JSON.parse(p.amenities) : [] });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.put('/api/properties/:id/status', authenticate, authorize('Properties', 'Edit'), async (req, res) => {
  const { status } = req.body;
  const updated = await prisma.property.update({
    where: { id: req.params.id as string },
    data: { status }
  });
  res.json({ ...updated, amenities: updated.amenities ? JSON.parse(updated.amenities) : [] });
});

// Bookings
app.get('/api/bookings', authenticate, authorize('Bookings', 'View'), async (req, res) => {
  const bookings = await prisma.booking.findMany();
  res.json(bookings);
});
app.put('/api/bookings/:id/status', authenticate, authorize('Bookings', 'Edit'), async (req, res) => {
  const { status } = req.body;
  const updated = await prisma.booking.update({
    where: { id: req.params.id as string },
    data: { status }
  });
  res.json(updated);
});

// Payments
app.get('/api/payments', authenticate, authorize('Payments', 'View'), async (req, res) => {
  const payments = await prisma.payment.findMany();
  res.json(payments);
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: 'Pending',
        isApproved: false
      }
    });
    res.json({ success: true, message: 'Registration successful. Waiting for Super Admin approval.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Secure Bootstrap for legacy accounts
app.post('/api/auth/bootstrap', async (req, res) => {
  try {
    const { email, newPassword, bootstrapToken } = req.body;
    
    // 1. Verify bootstrap secret
    const expectedToken = process.env.BOOTSTRAP_SECRET;
    
    if (!expectedToken) {
      return res.status(403).json({ error: 'Server configuration error: BOOTSTRAP_SECRET environment variable is missing on the server.' });
    }

    if (!bootstrapToken || bootstrapToken.trim() !== expectedToken.trim()) {
      return res.status(403).json({ error: 'Token mismatch. The provided token does not match the server secret. Please verify your token and redeploy.' });
    }

    // 2. Find the existing admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    // 3. Ensure single-use (only for uninitialized accounts)
    if (admin.password) {
      return res.status(400).json({ error: 'Account has already been initialized.' });
    }

    // 4. Securely hash and save the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Super Admin account securely initialized. You may now log in.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ 
    where: { email },
    include: { role: { include: { permissions: { include: { permission: true } } } } }
  });
  
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (!admin.password) {
    return res.status(403).json({ error: 'Account not initialized. Please run the secure bootstrap process.' });
  }
  
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (!admin.isApproved || admin.status !== 'Active') {
    return res.status(403).json({ error: admin.status === 'Pending' ? 'Your account is pending approval by the Super Admin.' : 'You are not authorized to access this system.' });
  }

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });
  
  const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1d' });
  
  const userPayload = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role?.name || 'Viewer',
    permissions: admin.role?.permissions.map(rp => rp.permission) || []
  };
  
  res.json({ user: userPayload, token });
});

app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
  const admin = req.user;
  const userPayload = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role?.name || 'Viewer',
    permissions: admin.role?.permissions.map((rp: any) => rp.permission) || []
  };
  res.json({ user: userPayload });
});

// System Health
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'StayZen Admin API is running' });
});
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StayZen Admin API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
