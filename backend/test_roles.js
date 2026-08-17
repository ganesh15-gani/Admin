const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findFirst({ where: { email: 'admin@stayzen.com' } });
  const token = jwt.sign({ id: admin.id, role: admin.roleId }, process.env.JWT_SECRET || 'fallback-secret-key-for-dev');
  
  const res = await fetch('http://localhost:5000/api/roles', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log(data);
}

main().finally(() => prisma.$disconnect());
