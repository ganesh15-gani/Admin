const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

async function main() {
  try {
    console.log('1. Fetching all Admins...');
    const admins = await prisma.admin.findMany();
    
    console.log('2. Seeding Permissions...');
    const modules = ['Dashboard', 'Users', 'Properties', 'Bookings', 'Payments', 'Settings', 'Vendors', 'Reports', 'CMS', 'Notifications', 'System'];
    const actions = ['View', 'Edit', 'Create', 'Delete'];

    const allPermissions = [];
    for (const mod of modules) {
      for (const act of actions) {
        // Skip System permissions except for explicit creation later
        if (mod === 'System') continue;
        
        let p = await prisma.permission.findFirst({ where: { module: mod, action: act } });
        if (!p) {
          p = await prisma.permission.create({ data: { module: mod, action: act } });
        }
        allPermissions.push(p);
      }
    }
    
    let fullAccess = await prisma.permission.findFirst({ where: { module: 'System', action: '*' } });
    if (!fullAccess) {
      fullAccess = await prisma.permission.create({ data: { module: 'System', action: '*' } });
    }

    console.log('3. Seeding Roles...');
    let superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          name: 'Super Admin',
          description: 'Full access to the entire system',
          permissions: {
            create: [...allPermissions.map(p => ({ permissionId: p.id })), { permissionId: fullAccess.id }]
          }
        }
      });
    }

    let staffRole = await prisma.role.findUnique({ where: { name: 'Staff' } });
    if (!staffRole) {
      staffRole = await prisma.role.create({
        data: {
          name: 'Staff',
          description: 'View and edit content',
          permissions: {
            create: allPermissions
              .filter(p => ['View', 'Edit'].includes(p.action) && !['Settings', 'Reports', 'CMS'].includes(p.module))
              .map(p => ({ permissionId: p.id }))
          }
        }
      });
    }
    
    let adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
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
    }

    let viewerRole = await prisma.role.findUnique({ where: { name: 'Viewer' } });
    if (!viewerRole) {
      viewerRole = await prisma.role.create({
        data: {
          name: 'Viewer',
          description: 'Read-only access',
          permissions: {
            create: allPermissions
              .filter(p => p.action === 'View' && p.module !== 'Settings')
              .map(p => ({ permissionId: p.id }))
          }
        }
      });
    }

    console.log('4. Migrating Admin Roles...');
    for (const admin of admins) {
      if (admin.email === 'admin@stayzen.com') {
        console.log(`Assigning Super Admin to ${admin.email}`);
        await prisma.admin.update({
          where: { id: admin.id },
          data: { 
            roleId: superAdminRole.id,
            status: 'Active',
            isApproved: true
          }
        });
      } else if (admin.email === 'john@stayzen.com') {
        console.log(`Assigning Staff to ${admin.email}`);
        await prisma.admin.update({
          where: { id: admin.id },
          data: { 
            roleId: staffRole.id,
            status: 'Active',
            isApproved: true
          }
        });
      }
    }

    console.log('Migration Complete.');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
