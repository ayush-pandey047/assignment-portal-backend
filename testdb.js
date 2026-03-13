require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    const users = await prisma.user.findMany();
    console.log('Users in database:', users);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();