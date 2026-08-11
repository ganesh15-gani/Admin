const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

async function main() {
  try {
    const john = await prisma.admin.findUnique({
      where: { email: 'john@stayzen.com' },
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

    if (john) {
      console.log('--- Account State ---');
      console.log('Password set:', john.password !== null);
      console.log('Status:', john.status);
      console.log('Is Approved:', john.isApproved);
      console.log('Role:', john.role?.name);
      
      console.log('\n--- Role Permissions ---');
      const perms = john.role?.permissions.map(p => `${p.permission.module}: ${p.permission.action}`);
      console.log(JSON.stringify(perms, null, 2));
    } else {
      console.log('John not found!');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
