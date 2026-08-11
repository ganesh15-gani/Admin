const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

async function main() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        isApproved: true,
        role: { select: { name: true } },
        password: false // Omit passwords
      }
    });
    console.log("Current Admin Records:");
    console.log(JSON.stringify(admins, null, 2));

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { permissions: true, admins: true }
        }
      }
    });
    console.log("Current Role Records:");
    console.log(JSON.stringify(roles, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
