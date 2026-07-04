import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://sms:sms@localhost:5432/sms_portal?schema=public'
  })
});

const packages = [
  { name: 'Starter', amountGhs: '50.00', smsUnits: 1000, sortOrder: 1 },
  { name: 'Basic', amountGhs: '100.00', smsUnits: 2200, sortOrder: 2 },
  { name: 'Business', amountGhs: '200.00', smsUnits: 4800, sortOrder: 3 },
  { name: 'Growth', amountGhs: '500.00', smsUnits: 12500, sortOrder: 4 },
  { name: 'Enterprise', amountGhs: '1000.00', smsUnits: 26000, sortOrder: 5 }
];

async function main() {
  for (const smsPackage of packages) {
    await prisma.smsPackage.upsert({
      where: { name: smsPackage.name },
      update: smsPackage,
      create: smsPackage
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Platform administrator'
    }
  });

  const clientAdminRole = await prisma.role.upsert({
    where: { name: 'CLIENT_ADMIN' },
    update: {},
    create: {
      name: 'CLIENT_ADMIN',
      description: 'Client account owner'
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@smsportal.local' },
    update: {},
    create: {
      email: 'admin@smsportal.local',
      fullName: 'SMS Portal Admin',
      passwordHash: await bcrypt.hash('ChangeMe123!', 10),
      isSuperAdmin: true,
      roleId: superAdminRole.id
    }
  });

  const demoClient = await prisma.client.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {
      name: 'Demo Organization',
      contactEmail: 'client@smsportal.local',
      contactPhone: '+233241234567',
      isActive: true
    },
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Demo Organization',
      contactEmail: 'client@smsportal.local',
      contactPhone: '+233241234567',
      wallet: { create: {} }
    }
  });

  await prisma.walletAccount.upsert({
    where: { clientId: demoClient.id },
    update: {},
    create: { clientId: demoClient.id }
  });

  await prisma.user.upsert({
    where: { email: 'client@smsportal.local' },
    update: {
      clientId: demoClient.id,
      roleId: clientAdminRole.id,
      fullName: 'Demo Client Admin',
      isSuperAdmin: false
    },
    create: {
      clientId: demoClient.id,
      email: 'client@smsportal.local',
      fullName: 'Demo Client Admin',
      passwordHash: await bcrypt.hash('ChangeMe123!', 10),
      isSuperAdmin: false,
      roleId: clientAdminRole.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
