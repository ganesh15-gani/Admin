const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } }
    });
    console.log("Success! Roles fetched:", roles.length);
  } catch (err) {
    console.error("Prisma Error:", err);
  }
}

main().finally(() => prisma.$disconnect());
