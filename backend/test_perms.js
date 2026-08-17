const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findFirst({
    where: { email: 'admin@stayzen.com' },
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
  console.log(JSON.stringify(admin.role.permissions.map(rp => rp.permission), null, 2));
}

main().finally(() => prisma.$disconnect());
