"use strict";
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
app.get('/api/seed-db', async (req, res) => {
    try {
        await prisma.property.deleteMany();
        await prisma.user.deleteMany();
        const u1 = await prisma.user.create({
            data: {
                name: 'Sarah Jenkins',
                email: 'sarah.j@example.com',
                phone: '+1 234-567-8901',
                status: 'Active',
                verification: 'Verified',
                joinedDate: '2023-01-15',
                lastLogin: '2024-04-20',
                bookingsCount: 12
            }
        });
        const u2 = await prisma.user.create({
            data: {
                name: 'Michael Chen',
                email: 'm.chen@example.com',
                phone: '+1 234-567-8902',
                status: 'Active',
                verification: 'Pending',
                joinedDate: '2024-02-10',
                lastLogin: '2024-04-18',
                bookingsCount: 3
            }
        });
        await prisma.property.create({
            data: {
                title: 'Luxury Villa with Ocean View',
                ownerId: u1.id,
                ownerName: 'Sarah Jenkins',
                type: 'Villa',
                location: 'Bali, Indonesia',
                price: 450,
                rating: 4.9,
                status: 'Approved',
                description: 'A beautiful luxury villa with a private infinity pool overlooking the ocean.',
                bedrooms: 4,
                bathrooms: 3,
                maxGuests: 8,
                amenities: JSON.stringify(['Pool', 'WiFi', 'Kitchen', 'Air Conditioning', 'Ocean View']),
                hostEmail: 'sarah.j@example.com',
                hostPhone: '+1 234-567-8901',
                imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
            }
        });
        await prisma.property.create({
            data: {
                title: 'Downtown Studio Apartment',
                ownerId: u2.id,
                ownerName: 'Michael Chen',
                type: 'Apartment',
                location: 'New York, USA',
                price: 120,
                rating: 4.7,
                status: 'Pending',
                description: 'A cozy downtown studio in the heart of the city.',
                bedrooms: 1,
                bathrooms: 1,
                maxGuests: 2,
                amenities: JSON.stringify(['WiFi', 'AC', 'Kitchenette']),
                hostEmail: 'm.chen@example.com',
                hostPhone: '+1 234-567-8902',
                imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1c24226133?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80'
            }
        });
        await prisma.property.create({
            data: {
                title: 'Rustic Cabin in the Woods',
                ownerId: u1.id,
                ownerName: 'Sarah Jenkins',
                type: 'Cabin',
                location: 'Aspen, Colorado',
                price: 250,
                rating: 4.8,
                status: 'Approved',
                description: 'Escape to nature in this beautiful A-frame cabin.',
                bedrooms: 2,
                bathrooms: 1,
                maxGuests: 4,
                amenities: JSON.stringify(['Fireplace', 'Hot Tub', 'WiFi']),
                hostEmail: 'sarah.j@example.com',
                hostPhone: '+1 234-567-8901',
                imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
            }
        });
        await prisma.property.create({
            data: {
                title: 'Modern Santorini Cave House',
                ownerId: u2.id,
                ownerName: 'Michael Chen',
                type: 'House',
                location: 'Santorini, Greece',
                price: 320,
                rating: 5.0,
                status: 'Approved',
                description: 'Experience traditional Greek architecture with modern luxury.',
                bedrooms: 2,
                bathrooms: 2,
                maxGuests: 4,
                amenities: JSON.stringify(['Plunge Pool', 'WiFi', 'AC']),
                hostEmail: 'm.chen@example.com',
                hostPhone: '+1 234-567-8902',
                imageUrl: 'https://images.unsplash.com/photo-1601581875039-e899893d520c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80'
            }
        });
        await prisma.property.create({
            data: {
                title: 'Chic Parisian Loft',
                ownerId: u1.id,
                ownerName: 'Sarah Jenkins',
                type: 'Apartment',
                location: 'Paris, France',
                price: 180,
                rating: 4.6,
                status: 'Pending',
                description: 'A stylish loft in Le Marais. High ceilings, large windows.',
                bedrooms: 1,
                bathrooms: 1,
                maxGuests: 3,
                amenities: JSON.stringify(['WiFi', 'Kitchen', 'Balcony']),
                hostEmail: 'sarah.j@example.com',
                hostPhone: '+1 234-567-8901',
                imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
            }
        });
        res.json({ success: true, message: 'Database seeded perfectly!' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
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
    }
    else {
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
    }
    else {
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
//# sourceMappingURL=index.js.map