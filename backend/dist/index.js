"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const child_process_1 = require("child_process");
const bcrypt = __importStar(require("bcryptjs"));
app.get('/api/seed-db', async (req, res) => {
    try {
        console.log('Running prisma db push...');
        (0, child_process_1.execSync)('npx prisma db push', { stdio: 'inherit' });
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});
const auth_1 = require("./middleware/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
// Admin Management
app.get('/api/admins', auth_1.authenticate, (0, auth_1.authorize)('Users', 'View'), async (req, res) => {
    const admins = await prisma.admin.findMany({
        include: { role: true }
    });
    res.json(admins.map(a => { const { password, ...rest } = a; return rest; }));
});
app.put('/api/admins/:id/status', auth_1.authenticate, (0, auth_1.authorize)('Users', 'Edit'), async (req, res) => {
    const { status, isApproved } = req.body;
    const admin = await prisma.admin.update({
        where: { id: req.params.id },
        data: { status, isApproved }
    });
    res.json(admin);
});
// Create Admin
app.post('/api/admins', auth_1.authenticate, async (req, res) => {
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
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
});
// Delete Admin
app.delete('/api/admins/:id', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role?.name !== 'Super Admin') {
            return res.status(403).json({ error: 'Only Super Admins can delete admins.' });
        }
        const targetId = req.params.id;
        if (req.user.id === targetId) {
            return res.status(400).json({ error: 'You cannot delete yourself.' });
        }
        await prisma.admin.delete({
            where: { id: targetId }
        });
        res.json({ success: true, message: 'Admin deleted successfully.' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Super Admin password assignment
app.put('/api/admins/:id/password', auth_1.authenticate, async (req, res) => {
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
            where: { id: req.params.id },
            data: { password: hashedPassword }
        });
        res.json({ success: true, message: 'Password set successfully.' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Roles
app.get('/api/roles', auth_1.authenticate, (0, auth_1.authorize)('Users', 'View'), async (req, res) => {
    const roles = await prisma.role.findMany({
        include: { permissions: { include: { permission: true } } }
    });
    res.json(roles);
});
// Users
app.get('/api/users', auth_1.authenticate, (0, auth_1.authorize)('Users', 'View'), async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});
app.get('/api/users/:id', auth_1.authenticate, (0, auth_1.authorize)('Users', 'View'), async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});
// Properties
app.get('/api/properties', auth_1.authenticate, (0, auth_1.authorize)('Properties', 'View'), async (req, res) => {
    const properties = await prisma.property.findMany();
    res.json(properties.map(p => ({
        ...p,
        amenities: p.amenities ? JSON.parse(p.amenities) : []
    })));
});
app.get('/api/properties/:id', auth_1.authenticate, (0, auth_1.authorize)('Properties', 'View'), async (req, res) => {
    const p = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (p) {
        res.json({ ...p, amenities: p.amenities ? JSON.parse(p.amenities) : [] });
    }
    else {
        res.status(404).json({ error: 'Not found' });
    }
});
app.put('/api/properties/:id/status', auth_1.authenticate, (0, auth_1.authorize)('Properties', 'Edit'), async (req, res) => {
    const { status } = req.body;
    const updated = await prisma.property.update({
        where: { id: req.params.id },
        data: { status }
    });
    res.json({ ...updated, amenities: updated.amenities ? JSON.parse(updated.amenities) : [] });
});
// Bookings
app.get('/api/bookings', auth_1.authenticate, (0, auth_1.authorize)('Bookings', 'View'), async (req, res) => {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
});
app.put('/api/bookings/:id/status', auth_1.authenticate, (0, auth_1.authorize)('Bookings', 'Edit'), async (req, res) => {
    const { status } = req.body;
    const updated = await prisma.booking.update({
        where: { id: req.params.id },
        data: { status }
    });
    res.json(updated);
});
// Payments
app.get('/api/payments', auth_1.authenticate, (0, auth_1.authorize)('Payments', 'View'), async (req, res) => {
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
    }
    catch (err) {
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
    }
    catch (err) {
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
    const token = jsonwebtoken_1.default.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1d' });
    const userPayload = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role?.name || 'Viewer',
        permissions: admin.role?.permissions.map(rp => rp.permission) || []
    };
    res.json({ user: userPayload, token });
});
app.get('/api/auth/me', auth_1.authenticate, async (req, res) => {
    const admin = req.user;
    const userPayload = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role?.name || 'Viewer',
        permissions: admin.role?.permissions.map((rp) => rp.permission) || []
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
//# sourceMappingURL=index.js.map