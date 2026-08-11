import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
    const decoded: any = jwt.verify(token, JWT_SECRET as string);

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
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const authorize = (module: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.user.role) {
      res.status(403).json({ error: 'Forbidden: No role assigned' });
      return;
    }

    const rolePermissions = req.user.role.permissions.map((rp: any) => rp.permission);
    
    // Check for System full access
    const hasFullAccess = rolePermissions.some((p: any) => p.module === 'System' && p.action === '*');
    if (hasFullAccess) {
      return next();
    }

    // Check for specific permission
    const hasPermission = rolePermissions.some((p: any) => p.module === module && (p.action === action || p.action === '*'));
    if (hasPermission) {
      return next();
    }

    res.status(403).json({ error: `Forbidden: You do not have permission to ${action} ${module}` });
  };
};
