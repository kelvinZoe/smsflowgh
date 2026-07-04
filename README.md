# SMS Portal MVP

Pay-as-you-go Bulk SMS platform for businesses, churches, schools, clinics, associations, and organizations.

This MVP is intentionally wallet-first:

- Clients buy SMS packages from this platform.
- Successful payments credit internal wallet SMS units.
- SMS campaigns spend wallet units.
- SMS sending is never coupled directly to a payment.
- There is no monthly subscription billing in the MVP.

## Stack

- Angular 22 frontend
- NestJS 11 backend
- PostgreSQL
- Prisma 7 ORM
- MTN MoMo Sandbox payment provider
- SMSOnlineGH SMS provider

## Quick Start

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:backend
```

In a second terminal:

```bash
npm run dev:frontend
```

## Seeded SMS Packages

| Package | Amount | SMS Units | Price Per SMS |
| --- | ---: | ---: | ---: |
| Starter | GH¢50 | 1,000 | GH¢0.0500 |
| Basic | GH¢100 | 2,200 | GH¢0.0455 |
| Business | GH¢200 | 4,800 | GH¢0.0417 |
| Growth | GH¢500 | 12,500 | GH¢0.0400 |
| Enterprise | GH¢1,000 | 26,000 | GH¢0.0385 |

Package pricing lives in the database and is exposed to Angular through the backend API.

## Seeded Local Users

- Super admin: `admin@smsportal.local` / `ChangeMe123!`
- Client admin: `client@smsportal.local` / `ChangeMe123!`
