const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const props = await prisma.property.findMany();
    if (props.length === 0) return;

    for (let i = 0; i < props.length; i++) {
      const p = props[i];
      let newStatus = 'Approved';
      if (i % 3 === 1) newStatus = 'Pending';
      if (i % 3 === 2) newStatus = 'Suspended';
      
      if (p.status !== newStatus) {
        await prisma.property.update({
          where: { id: p.id },
          data: { status: newStatus }
        });
        console.log(`Updated ${p.title} to ${newStatus}`);
      }
    }
    console.log("Status update complete");
  } catch(e) {
    console.log(e);
  }
}
run();
