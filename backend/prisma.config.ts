import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://sms:sms@localhost:5432/sms_portal?schema=public'
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts'
  }
});
