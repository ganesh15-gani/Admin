const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    const admins = await prisma.admin.findMany();
    console.log("Admins:");
    console.log(JSON.stringify(admins, null, 2));
    
    const roles = await prisma.role.findMany();
    console.log("Roles:");
    console.log(JSON.stringify(roles, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
