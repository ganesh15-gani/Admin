"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized: Invalid token format' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.admin.findUnique({
            where: { id: decoded.id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true }
                        }
                    }
                }
            }
        });
        if (!user) {
            res.status(401).json({ error: 'Unauthorized: Invalid user' });
            return;
        }
        if (user.status !== 'Active') {
            res.status(403).json({ error: 'Forbidden: Account is not active' });
            return;
        }
        if (!user.isApproved) {
            res.status(403).json({ error: 'Forbidden: Account is pending approval' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.authenticate = authenticate;
const authorize = (module, action) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!req.user.role) {
            res.status(403).json({ error: 'Forbidden: No role assigned' });
            return;
        }
        const rolePermissions = req.user.role.permissions.map((rp) => rp.permission);
        // Check for System full access
        const hasFullAccess = rolePermissions.some((p) => p.module === 'System' && p.action === '*');
        if (hasFullAccess) {
            return next();
        }
        // Check for specific permission
        const hasPermission = rolePermissions.some((p) => p.module === module && (p.action === action || p.action === '*'));
        if (hasPermission) {
            return next();
        }
        res.status(403).json({ error: `Forbidden: You do not have permission to ${action} ${module}` });
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map