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

// VENDORS ROUTES
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const { name, email, phone, companyName } = req.body;
    
    // Check if email exists
    const existing = await prisma.vendor.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        companyName,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
    });
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

app.put('/api/vendors/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id },
      data: { status }
    });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vendor status' });
  }
});

app.delete('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vendor.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// BANK ACCOUNT ROUTES
app.get('/api/bank-accounts', async (req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank accounts' });
  }
});

app.put('/api/bank-accounts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const account = await prisma.bankAccount.update({
      where: { id },
      data: { status }
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank account status' });
  }
});

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
    await prisma.vendor.deleteMany();
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

    console.log('Seeding Vendors & Bank Accounts...');
    const vendors = [];
    for (let i = 1; i <= 5; i++) {
      const vendor = await prisma.vendor.create({
        data: {
          name: `Vendor Partner ${i}`,
          email: `vendor${i}@stayzen.com`,
          phone: `+1 555 010${i}`,
          companyName: `Luxury Stays ${i} LLC`,
          status: i % 3 === 0 ? 'Pending' : 'Active',
          propertiesCount: Math.floor(Math.random() * 5) + 1,
          rating: 4.5 + (Math.random() * 0.5),
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          kycStatus: i % 3 === 0 ? 'Pending' : 'Verified'
        }
      });
      vendors.push(vendor);

      await prisma.bankAccount.create({
        data: {
          vendorId: vendor.id,
          vendorName: vendor.name,
          bankName: ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'US Bank'][i % 5],
          accountType: i % 2 === 0 ? 'Checking' : 'Savings',
          accountNumber: `**** **** **** ${1000 + i}`,
          accountHolder: vendor.name,
          status: i % 2 === 0 ? 'Linked' : 'Pending',
          swiftCode: `SWIFT${100 + i}US`
        }
      });
    }

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

// Dashboard Metrics
app.get('/api/dashboard/metrics', authenticate, authorize('Dashboard', 'View'), async (req, res) => {
  try {
    const filter = req.query.filter as string || 'This Year';
    
    const [totalUsers, totalProperties, pendingApprovals, activeBookings, revenueData] = await Promise.all([
      prisma.admin.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'Pending' } }),
      prisma.booking.count({ where: { status: { not: 'Cancelled' } } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'Successful' }
      })
    ]);

    const totalRevenue = revenueData._sum.amount || 0;

    // Simulate active vendors and support tickets as requested
    const activeVendors = 12;
    const supportTickets = 5;

    // Dynamic multipliers to simulate trend changes
    let multiplier = 1;
    if (filter === 'Today') multiplier = 0.01;
    if (filter === '7 Days') multiplier = 0.08;
    if (filter === '30 Days') multiplier = 0.25;

    res.json({
      totalUsers,
      totalProperties,
      pendingApprovals,
      activeBookings,
      totalRevenue,
      activeVendors,
      supportTickets,
      cancellationRate: filter === 'This Year' ? 2.4 : filter === 'Today' ? 0 : 1.2,
      trends: {
        users: filter === 'Today' ? 1.5 : filter === '7 Days' ? 4.2 : 12.5,
        properties: filter === 'Today' ? 0 : filter === '7 Days' ? 1.2 : 5.2,
        bookings: filter === 'Today' ? -0.5 : filter === '7 Days' ? 1.4 : -2.4,
        revenue: filter === 'Today' ? 2.1 : filter === '7 Days' ? 8.5 : 18.2
      }
    });
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
app.post('/api/properties', authenticate, authorize('Properties', 'Edit'), async (req, res) => {
  const { title, type, location, price, description, bedrooms, bathrooms, maxGuests, amenities } = req.body;
  
  if (!title || !location || !price) {
    return res.status(400).json({ error: 'Title, location, and price are required.' });
  }

  const newProp = await prisma.property.create({
    data: {
      title,
      type: type || 'Apartment',
      location,
      price: Number(price),
      description: description || '',
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      maxGuests: Number(maxGuests) || 2,
      amenities: amenities ? JSON.stringify(amenities) : '[]',
      status: 'Pending',
      ownerName: (req as any).user?.name || 'Admin',
      ownerId: (req as any).user?.id || 'admin-id',
      rating: 0
    }
  });
  
  res.status(201).json({ ...newProp, amenities: newProp.amenities ? JSON.parse(newProp.amenities) : [] });
});

app.delete('/api/properties/:id', authenticate, authorize('Properties', 'Edit'), async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
