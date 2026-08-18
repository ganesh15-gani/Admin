const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const admin = await prisma.admin.findFirst({ where: { role: { name: 'Super Admin' } } });
    if (!admin) {
      console.log("No super admin found");
      return;
    }

    console.log("Admin found:", admin.name);

    // Check how many properties exist
    const count = await prisma.property.count();
    console.log("Total properties before:", count);
  } catch(e) {
    console.log(e);
  }
}
run();
