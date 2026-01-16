//server\user-service\prisma\seed.ts
import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/utils/prisma.js';
import { logger } from '../src/utils/logger.js';

async function main() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME || 'admin';

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
        passwordHash,
        emailVerified: true,
        emailVerifiedAt: new Date()
      },
      create: {
        email: email.toLowerCase(),
        username,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        adminProfile: { create: {} }
      }
    });

    // Ensure AdminProfile exists
    const profileExists = await prisma.adminProfile.findUnique({ 
      where: { userId: admin.id } 
    });
    
    if (!profileExists) {
      await prisma.adminProfile.create({ data: { userId: admin.id } });
    }

    logger.info(`Admin user seeded: ${admin.email}`);
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
