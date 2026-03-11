const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@test.com' },
        update: {},
        create: {
          name: 'John Teacher',
          email: 'teacher@test.com',
          password: hashedPassword,
          role: 'TEACHER',
        },
    });

    const student1 = await prisma.user.upsert({
        where: { email: 'student1@test.com' },
        update: {},
        create: {
          name: 'Alice Student',
          email: 'student1@test.com',
          password: hashedPassword,
          role: 'STUDENT',
        },
    });
    
    const student2 = await prisma.user.upsert({
        where: { email: 'student2@test.com' },
    update: {},
    create: {
      name: 'Bob Student',
      email: 'student2@test.com',
      password: hashedPassword,
      role: 'STUDENT',
     },
    });

    console.log('Seeded users:');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
    