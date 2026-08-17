import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Finding or creating Sales role...');
  
  let salesRole = await prisma.role.findUnique({ where: { name: 'Sales' } });
  
  if (!salesRole) {
    salesRole = await prisma.role.create({
      data: {
        name: 'Sales',
        description: 'Sales staff who can view and approve properties, and view bookings.',
      }
    });
    console.log('Created Sales role:', salesRole.id);
  } else {
    console.log('Sales role already exists:', salesRole.id);
  }

  // Find permissions for Properties and Bookings
  const propertiesView = await prisma.permission.findUnique({ where: { module_action: { module: 'Properties', action: 'View' } } });
  const propertiesEdit = await prisma.permission.findUnique({ where: { module_action: { module: 'Properties', action: 'Edit' } } });
  const bookingsView = await prisma.permission.findUnique({ where: { module_action: { module: 'Bookings', action: 'View' } } });

  const permissionsToAssign = [propertiesView, propertiesEdit, bookingsView].filter(p => p !== null);

  for (const perm of permissionsToAssign) {
    if (!perm) continue;
    // Check if it already exists
    const existing = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: salesRole.id,
          permissionId: perm.id
        }
      }
    });

    if (!existing) {
      await prisma.rolePermission.create({
        data: {
          roleId: salesRole.id,
          permissionId: perm.id
        }
      });
      console.log(`Assigned permission: ${perm.module} - ${perm.action}`);
    }
  }

  console.log('Sales role setup complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
