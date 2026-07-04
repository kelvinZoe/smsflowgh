# SMS Portal MVP Handoff

This document hands off the current state of the Bulk SMS platform scaffold in this repository. It is meant for another developer to understand what was added, why it was structured this way, how to run it, and where the next implementation work should continue.

## Product Summary

This is a pay-as-you-go Bulk SMS platform for businesses, churches, schools, clinics, associations, and organizations.

The MVP is not a monthly SaaS subscription product. There is no subscription billing, recurring billing, coupons, discounts, partial payment, credit sales, refund automation, multiple providers, complex approvals, AI generation, WhatsApp integration, or full accounting in this implementation.

The intended business flow is:

1. Client logs in.
2. Client views SMS wallet balance.
3. Client buys SMS credits by selecting a database-backed SMS package.
4. Client enters MTN MoMo number.
5. Backend creates a pending payment and calls MTN MoMo Request To Pay.
6. Client approves payment on phone.
7. Backend verifies settlement through callback and polling.
8. Successful payment credits the internal SMS wallet.
9. Wallet ledger transaction is created.
10. Client sends SMS campaigns.
11. Campaign sending deducts from the wallet.
12. Campaign history and delivery records are stored.

Important invariant: payment buys wallet credits. Wallet credits buy SMS. SMS sending must never happen directly from a payment.

## Stack

- Frontend: Angular 22
- Backend: NestJS 11
- Database: PostgreSQL
- ORM: Prisma 7
- Payments: MTN MoMo Sandbox adapter placeholder
- SMS delivery: SMSOnlineGH adapter placeholder
- Workspace: npm workspaces with `backend` and `frontend`

## Root Files Added

- `package.json`: root npm workspace scripts.
- `package-lock.json`: generated dependency lockfile.
- `.gitignore`: ignores dependencies, builds, env files, logs, TS build info, macOS metadata.
- `.env.example`: local environment template for database, API, frontend origin, JWT, MTN MoMo, and SMSOnlineGH credentials.
- `docker-compose.yml`: local PostgreSQL service.
- `README.md`: short project overview and quick start.
- `docs/architecture.md`: architectural overview and flow notes.
- `docs/api.md`: API route inventory.
- `handoff.md`: this document.

## Workspace Scripts

Root scripts in `package.json`:

- `npm run dev`: starts backend dev server.
- `npm run dev:backend`: starts NestJS dev server.
- `npm run dev:frontend`: starts Angular dev server.
- `npm run build`: builds backend and frontend.
- `npm run test`: runs backend Jest command.
- `npm run db:generate`: generates Prisma client.
- `npm run db:migrate`: runs Prisma migration dev.
- `npm run db:seed`: seeds initial data.

Backend scripts:

- `npm run build --workspace backend`
- `npm run start --workspace backend`
- `npm run start:dev --workspace backend`
- `npm run test --workspace backend`
- `npm run prisma:generate --workspace backend`
- `npm run prisma:migrate --workspace backend`
- `npm run prisma:seed --workspace backend`

Frontend scripts:

- `npm run start --workspace frontend`
- `npm run build --workspace frontend`
- `npm run test --workspace frontend`

## Runtime Requirements

Angular 22 requires Node `22.22.3+`, `24.15.0+`, or `26+`.

The local environment was upgraded to Node `24.15.0` through nvm during development. If Angular CLI reports Node `22.18.0`, run:

```bash
nvm use 24.15.0
node -v
```

Then rerun the build or dev server.

## Setup

From the repo root:

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

Frontend URL:

```txt
http://localhost:4200/
```

Backend API URL:

```txt
http://localhost:3000/api
```

Seeded super admin:

```txt
Email: admin@smsportal.local
Password: ChangeMe123!
```

Seeded demo client admin:

```txt
Email: client@smsportal.local
Password: ChangeMe123!
```

Change this password before any non-local use.

## Backend Structure

Backend root:

- `backend/src/main.ts`: Nest bootstrap, CORS, global prefix `/api`, validation pipe.
- `backend/src/app.module.ts`: imports all backend modules.
- `backend/prisma/schema.prisma`: database schema.
- `backend/prisma/seed.ts`: seed roles, super admin, and SMS packages.
- `backend/prisma.config.ts`: Prisma 7 config with datasource and migrations path.

Backend modules added:

- `auth`
- `clients`
- `users`
- `roles`
- `sms-packages`
- `wallet`
- `payments`
- `mtn-momo`
- `sms-provider`
- `smsonlinegh`
- `sender-ids`
- `contacts`
- `contact-groups`
- `message-templates`
- `campaigns`
- `reports`
- `audit-logs`
- `prisma`
- `common`

## Backend Common Layer

Files:

- `backend/src/common/decorators/current-user.decorator.ts`
- `backend/src/common/guards/jwt-auth.guard.ts`
- `backend/src/common/guards/super-admin.guard.ts`
- `backend/src/common/utils/sms-units.ts`

Purpose:

- Extract authenticated user from request.
- Validate JWT bearer tokens.
- Guard super admin routes.
- Calculate SMS units using a simple 160-character segment rule.

Note: SMS unit calculation is intentionally simple for MVP. Production work should account for GSM-7 vs Unicode segmentation and provider-specific billing rules.

## Auth Module

Files:

- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/dto.ts`

Route:

- `POST /api/auth/login`

Behavior:

- Looks up user by email.
- Checks active status.
- Verifies bcrypt password.
- Returns JWT and user profile.
- Writes `AUTH_LOGIN` audit log.

JWT payload:

- `id`
- `clientId`
- `isSuperAdmin`
- `email`

## Clients Module

Files:

- `backend/src/clients/clients.module.ts`
- `backend/src/clients/clients.controller.ts`
- `backend/src/clients/clients.service.ts`
- `backend/src/clients/dto.ts`

Routes:

- `GET /api/admin/clients`
- `POST /api/admin/clients`

Behavior:

- Super admin can list clients with wallet.
- Super admin can create a client.
- Client creation automatically creates wallet account.
- Writes `CLIENT_CREATE` audit log.

## Users and Roles Modules

Files:

- `backend/src/users/*`
- `backend/src/roles/*`

Routes:

- `GET /api/users`
- `POST /api/users`
- `GET /api/admin/roles`

Behavior:

- Users are scoped to authenticated user's `clientId` unless the actor is super admin.
- Super admin can create platform or client users.
- Client users are attached to a client.
- Passwords are hashed with bcrypt.
- Writes `USER_CREATE` audit log.

Seeded roles:

- `SUPER_ADMIN`
- `CLIENT_ADMIN`

## SMS Packages Module

Files:

- `backend/src/sms-packages/sms-packages.module.ts`
- `backend/src/sms-packages/sms-packages.controller.ts`
- `backend/src/sms-packages/sms-packages.service.ts`
- `backend/src/sms-packages/dto.ts`

Routes:

- `GET /api/sms-packages`
- `GET /api/admin/sms-packages`
- `POST /api/admin/sms-packages`
- `PATCH /api/admin/sms-packages/:id`

Behavior:

- Public/client route returns only active packages.
- Admin route returns all packages.
- Admin can create and update packages.
- Admin can activate/deactivate packages using `isActive`.
- Writes package create/update audit logs.

Seeded packages:

| Package | Amount | SMS Units | Price Per SMS |
| --- | ---: | ---: | ---: |
| Starter | GH¢50 | 1,000 | GH¢0.0500 |
| Basic | GH¢100 | 2,200 | GH¢0.0455 |
| Business | GH¢200 | 4,800 | GH¢0.0417 |
| Growth | GH¢500 | 12,500 | GH¢0.0400 |
| Enterprise | GH¢1,000 | 26,000 | GH¢0.0385 |

Important: package amounts and SMS units are not hardcoded in the frontend. Angular loads packages through `/api/sms-packages`.

## Wallet Module

Files:

- `backend/src/wallet/wallet.module.ts`
- `backend/src/wallet/wallet.controller.ts`
- `backend/src/wallet/wallet.service.ts`
- `backend/src/wallet/dto.ts`

Routes:

- `GET /api/wallet/summary`
- `GET /api/wallet/transactions`
- `POST /api/admin/wallet/top-up`

Behavior:

- Wallet accounts hold SMS unit balances.
- Wallet operations are ledgered in `WalletTransaction`.
- Credit and debit operations record `balanceBefore`, `balanceAfter`, `units`, source, and idempotency key.
- Payment credits use idempotency key `payment:{paymentId}`.
- Campaign debits use idempotency key `campaign:{campaignId}`.
- Manual top-up writes `WALLET_MANUAL_TOP_UP` audit log.

Important services:

- `creditFromPayment(paymentId, tx)`: transaction-safe and idempotent wallet credit.
- `debitForCampaign({ clientId, campaignId, units, tx })`: transaction-safe wallet debit with insufficient balance check.
- `manualTopUp(dto, actor)`: admin top-up flow.

## Payments Module

Files:

- `backend/src/payments/payments.module.ts`
- `backend/src/payments/payments.controller.ts`
- `backend/src/payments/payments.service.ts`
- `backend/src/payments/dto/create-payment.dto.ts`
- `backend/src/payments/dto/momo-callback.dto.ts`
- `backend/src/payments/providers/payment-provider.interface.ts`
- `backend/src/payments/providers/mtn-momo.provider.ts`

Routes:

- `POST /api/payments`
- `GET /api/payments`
- `POST /api/payments/:id/verify`
- `POST /api/payments/mtn-momo/callback`

Payment creation behavior:

1. Requires authenticated client user.
2. Loads active selected `SmsPackage`.
3. Snapshots `amountGhs` and `smsUnits` into `Payment`.
4. Creates unique `providerReference`.
5. Calls configured payment provider.
6. Stores provider status/raw response.
7. Writes `PAYMENT_CREATE` audit log.

Payment settlement behavior:

1. Callback or verify updates provider status.
2. If provider status is successful, payment becomes `SUCCESSFUL`.
3. Wallet credit is applied inside a Prisma transaction.
4. Idempotency prevents double credit.
5. Writes `PAYMENT_SUCCESS_CREDIT_WALLET` or `PAYMENT_STATUS_UPDATE` audit log.

Current MTN MoMo provider status:

- Placeholder/mock implementation.
- If credentials are missing, returns pending mock response.
- Real integration still needs access token creation, request-to-pay API call, status polling, and callback signature/security handling.

## SMS Provider and SMSOnlineGH Modules

Files:

- `backend/src/sms-provider/sms-provider.interface.ts`
- `backend/src/sms-provider/sms-provider.module.ts`
- `backend/src/smsonlinegh/smsonlinegh.module.ts`
- `backend/src/smsonlinegh/smsonlinegh.provider.ts`

Behavior:

- Defines backend-only SMS provider abstraction.
- Binds `SMS_PROVIDER` token to `SmsOnlineGhProvider`.
- Current SMSOnlineGH provider returns mock success when credentials are missing.
- Real SMSOnlineGH API integration still needs to be implemented.

Important security rule:

- Angular must never call SMSOnlineGH directly.
- SMS provider credentials must stay in backend env/config.

## Campaigns Module

Files:

- `backend/src/campaigns/campaigns.module.ts`
- `backend/src/campaigns/campaigns.controller.ts`
- `backend/src/campaigns/campaigns.service.ts`
- `backend/src/campaigns/dto.ts`

Routes:

- `GET /api/campaigns`
- `GET /api/campaigns/:id`
- `POST /api/campaigns`

Campaign send behavior:

1. Requires authenticated client user.
2. Accepts title, sender ID, message, direct recipients, and/or contact group IDs.
3. Resolves recipients from direct input plus selected groups.
4. Calculates units per recipient.
5. Creates campaign and recipient rows.
6. Debits wallet inside the same transaction.
7. Sends messages through backend SMS provider adapter.
8. Updates recipient delivery statuses.
9. Updates campaign status.
10. Writes `CAMPAIGN_SEND` audit log.

Important invariant:

- Wallet debit happens before provider send.
- SMS sending does not depend directly on a payment.

## Contacts and Contact Groups Modules

Files:

- `backend/src/contacts/*`
- `backend/src/contact-groups/*`

Routes:

- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/contact-groups`
- `POST /api/contact-groups`

Behavior:

- Contacts are scoped by `clientId`.
- Contact phone is unique per client.
- Contact groups are scoped by `clientId`.
- Group membership uses join table `ContactGroupMember`.

Current gap:

- CSV/Excel import page and backend parser are not implemented yet.

## Message Templates Module

Files:

- `backend/src/message-templates/*`

Routes:

- `GET /api/message-templates`
- `POST /api/message-templates`

Behavior:

- Templates are scoped by `clientId`.
- Template name is unique per client.

## Sender IDs Module

Files:

- `backend/src/sender-ids/*`

Routes:

- `GET /api/sender-ids`
- `POST /api/sender-ids`

Behavior:

- Sender IDs are scoped by `clientId`.
- New sender IDs default to `PENDING`.
- DTO validates common 2-11 character alphanumeric sender ID rules.

Current gap:

- Admin approval/rejection endpoint is not implemented yet.

## Reports Module

Files:

- `backend/src/reports/reports.module.ts`
- `backend/src/reports/reports.controller.ts`
- `backend/src/reports/reports.service.ts`

Route:

- `GET /api/reports/dashboard`

Behavior:

- Returns simple dashboard aggregates:
  - wallet credits
  - wallet debits
  - successful payment count
  - campaign count
  - sent units
  - provider balance placeholder

Current gap:

- Revenue report, profit report, provider balance integration, failed-message report, and richer analytics are not implemented yet.

## Audit Logs Module

Files:

- `backend/src/audit-logs/*`

Route:

- `GET /api/admin/audit-logs`

Behavior:

- Records critical actions from auth, clients, users, packages, payments, wallet top-up, and campaigns.
- Admin can list recent audit logs.

## Prisma Schema

Main schema file:

- `backend/prisma/schema.prisma`

Prisma 7 config:

- `backend/prisma.config.ts`

Prisma client service:

- `backend/src/prisma/prisma.service.ts`

Prisma 7 note:

- Datasource URL is not stored in `schema.prisma`.
- Datasource is configured in `prisma.config.ts`.
- Runtime Prisma Client uses `@prisma/adapter-pg` with `PrismaPg`.

Enums:

- `UserStatus`: `ACTIVE`, `DISABLED`
- `SenderIdStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `PaymentStatus`: `PENDING`, `PROCESSING`, `SUCCESSFUL`, `FAILED`, `CANCELLED`
- `PaymentProvider`: `MTN_MOMO`
- `WalletTransactionType`: `CREDIT`, `DEBIT`, `ADJUSTMENT`
- `WalletTransactionSource`: `PAYMENT`, `CAMPAIGN`, `MANUAL_TOP_UP`, `CORRECTION`
- `CampaignStatus`: `DRAFT`, `QUEUED`, `SENDING`, `SENT`, `FAILED`
- `DeliveryStatus`: `QUEUED`, `SENT`, `FAILED`

Models:

- `Client`
- `Role`
- `User`
- `SmsPackage`
- `WalletAccount`
- `WalletTransaction`
- `Payment`
- `SenderId`
- `Contact`
- `ContactGroup`
- `ContactGroupMember`
- `MessageTemplate`
- `Campaign`
- `CampaignRecipient`
- `AuditLog`

Multi-client tables include `clientId`:

- `User`
- `WalletAccount`
- `WalletTransaction`
- `Payment`
- `SenderId`
- `Contact`
- `ContactGroup`
- `MessageTemplate`
- `Campaign`
- `AuditLog`

Key database safeguards:

- One wallet account per client: `WalletAccount.clientId @unique`
- One contact phone per client: `Contact @@unique([clientId, phone])`
- One group name per client: `ContactGroup @@unique([clientId, name])`
- One sender ID name per client: `SenderId @@unique([clientId, name])`
- One template name per client: `MessageTemplate @@unique([clientId, name])`
- One wallet transaction per idempotency key: `WalletTransaction.idempotencyKey @unique`
- One payment provider reference: `Payment.providerReference @unique`

Payment stores package snapshot:

- `amountGhs`
- `smsUnits`
- `smsPackageId`

This ensures package edits do not mutate historical payments.

## Frontend Structure

Frontend root:

- `frontend/angular.json`
- `frontend/package.json`
- `frontend/src/main.ts`
- `frontend/src/index.html`
- `frontend/src/styles.css`
- `frontend/src/environments/environment.ts`

Core files:

- `frontend/src/app/app.component.ts`: shell layout, sidebar nav, sign out.
- `frontend/src/app/app.config.ts`: router and HTTP interceptor for bearer token.
- `frontend/src/app/app.routes.ts`: route definitions.
- `frontend/src/app/core/auth/auth.guard.ts`: route guards for authenticated and super admin routes.
- `frontend/src/app/core/auth/session.service.ts`: localStorage-backed session.
- `frontend/src/app/core/services/api.service.ts`: typed API calls.

Pages added:

- `frontend/src/app/features/login/login-page.component.ts`
- `frontend/src/app/features/dashboard/dashboard-page.component.ts`
- `frontend/src/app/features/wallet/buy-credits-page.component.ts`
- `frontend/src/app/features/payments/payments-page.component.ts`
- `frontend/src/app/features/campaigns/campaigns-page.component.ts`
- `frontend/src/app/features/admin/admin-page.component.ts`

Frontend routes:

- `/`: dashboard
- `/login`: login
- `/buy-credits`: buy SMS credits
- `/payments`: payment history and verify action
- `/campaigns`: compose/send campaign and campaign list
- `/admin`: admin SMS package controls

## Frontend Page Inventory

### Login

File:

- `frontend/src/app/features/login/login-page.component.ts`

Behavior:

- Default local credentials are prefilled for quick testing.
- Calls `/api/auth/login`.
- Stores JWT and user in `localStorage`.
- Redirects to dashboard.

### Dashboard

File:

- `frontend/src/app/features/dashboard/dashboard-page.component.ts`

Behavior:

- Loads wallet balance.
- Loads dashboard report.
- Loads active packages.
- Loads recent payments.
- Shows summary metrics and package/payment panels.

### Buy Credits

File:

- `frontend/src/app/features/wallet/buy-credits-page.component.ts`

Behavior:

- Loads active packages from backend.
- Lets user select package.
- Accepts MTN MoMo number.
- Calls `POST /api/payments`.
- Shows created payment reference and status.

Important:

- Package amount and SMS units come from backend, not frontend constants.

### Payments

File:

- `frontend/src/app/features/payments/payments-page.component.ts`

Behavior:

- Lists payments.
- Shows package, amount, units, status.
- Allows user to call verify endpoint.

### Campaigns

File:

- `frontend/src/app/features/campaigns/campaigns-page.component.ts`

Behavior:

- Allows direct recipient entry using comma or newline separation.
- Accepts title, sender ID, and message.
- Calls `POST /api/campaigns`.
- Lists recent campaigns with recipients, units, and status.

Current gap:

- UI does not yet expose contact groups, templates, contact import, or sender ID approval flow.

### Admin

File:

- `frontend/src/app/features/admin/admin-page.component.ts`

Behavior:

- Loads all SMS packages from admin endpoint.
- Shows amount, units, calculated rate, status.
- Activates/deactivates packages using `PATCH /api/admin/sms-packages/:id`.

Current gap:

- Other admin pages are not implemented yet: manage clients, all payments, all wallet transactions, all campaigns, failed messages, revenue/profit reports, provider balance, audit logs.

## Styling Approach

File:

- `frontend/src/styles.css`

Design direction:

- Operational dashboard, not a marketing landing page.
- Dense but readable panels.
- Muted paper background with green/blue/amber accents.
- Cards are simple 8px panels.
- Responsive layout collapses sidebar and grids on smaller screens.

## API Surface

Public:

- `POST /api/auth/login`
- `GET /api/sms-packages`
- `POST /api/payments/mtn-momo/callback`

Client portal:

- `GET /api/wallet/summary`
- `GET /api/wallet/transactions`
- `POST /api/payments`
- `GET /api/payments`
- `POST /api/payments/:id/verify`
- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/contact-groups`
- `POST /api/contact-groups`
- `GET /api/message-templates`
- `POST /api/message-templates`
- `GET /api/sender-ids`
- `POST /api/sender-ids`
- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `GET /api/reports/dashboard`
- `GET /api/users`
- `POST /api/users`

Super admin:

- `GET /api/admin/clients`
- `POST /api/admin/clients`
- `GET /api/admin/roles`
- `GET /api/admin/sms-packages`
- `POST /api/admin/sms-packages`
- `PATCH /api/admin/sms-packages/:id`
- `POST /api/admin/wallet/top-up`
- `GET /api/admin/audit-logs`

## Environment Variables

See `.env.example`.

Core:

- `DATABASE_URL`
- `API_PORT`
- `API_HOST`
- `FRONTEND_ORIGIN`
- `JWT_SECRET`

MTN MoMo:

- `MTN_MOMO_ENVIRONMENT`
- `MTN_MOMO_BASE_URL`
- `MTN_MOMO_COLLECTION_PRIMARY_KEY`
- `MTN_MOMO_COLLECTION_USER_ID`
- `MTN_MOMO_COLLECTION_API_KEY`
- `MTN_MOMO_CALLBACK_URL`

SMSOnlineGH:

- `SMSONLINEGH_BASE_URL`
- `SMSONLINEGH_API_KEY`
- `SMSONLINEGH_CLIENT_ID`

## Verification Already Performed

The following checks passed during the scaffold:

```bash
npm install
npm run db:generate
npx prisma validate --schema backend/prisma/schema.prisma
npm run build --workspace backend
npm test --workspace backend
./node_modules/.bin/tsc -p frontend/tsconfig.app.json --noEmit
npm run build --workspace frontend
```

Notes:

- Backend Jest command passes with no tests found because no test files have been added yet.
- Frontend Angular build passes under Node `24.15.0`.
- Angular dev server was started successfully and served at `http://localhost:4200/`.

## Dev Server Status

The Angular dev server was started with:

```bash
npm run dev:frontend
```

It served:

```txt
Local: http://localhost:4200/
Network: http://192.168.137.155:4200/
```

If the server is not currently running, restart it with:

```bash
nvm use 24.15.0
npm run dev:frontend
```

Backend still needs to be started separately:

```bash
npm run dev:backend
```

## Important Known Gaps

The current implementation is a strong MVP scaffold, not a completed production platform.

Provider integrations:

- MTN MoMo provider is placeholder/mock.
- SMSOnlineGH provider is placeholder/mock.
- Callback security/signature verification is not implemented.
- MoMo access token handling is not implemented.
- MoMo request-to-pay HTTP call is not implemented.
- Provider status polling is a placeholder.
- Provider balance is a report placeholder.

Authentication and authorization:

- JWT auth exists.
- Role-based permission matrix is not implemented.
- Client admin vs staff permissions are not detailed yet.
- Refresh tokens are not implemented.

Data and operations:

- No migrations have been committed yet unless `npm run db:migrate` is run.
- No automated tests have been added yet.
- CSV/Excel contact import is not implemented.
- Contact group management UI is not implemented.
- Message templates UI is not implemented.
- Sender ID admin approval UI/API is not implemented.
- Campaign delivery retry logic is not implemented.
- Failed message report is not implemented.
- Revenue/profit report is not implemented.
- Manual wallet top-up UI is not implemented.

Frontend:

- Core portal pages exist.
- Several MVP menu areas are backend-only or not yet represented in Angular.
- Route guards redirect unauthenticated users to login and limit `/admin` to super admins.
- Error handling is minimal.
- No loading skeletons or empty-state polish beyond basic rendering.

Database/accounting:

- Wallet ledger is append-only in shape, but there is no double-entry accounting.
- No refund automation by design.
- No package expiry by design.
- No subscription tables by design.

## Recommended Next Development Steps

1. Run Prisma migration and seed against local Postgres.
2. Start backend and frontend together.
3. Build admin pages for clients, wallet top-up, payments, campaigns, audit logs.
4. Build contact import flow for CSV/Excel.
5. Implement sender ID approval flow.
6. Replace MTN MoMo placeholder with real sandbox integration.
7. Replace SMSOnlineGH placeholder with real SMS API integration.
8. Add unit tests for wallet credit/debit idempotency.
9. Add integration tests for payment settlement and campaign debit.
10. Add campaign delivery retry/reporting.
11. Add more robust SMS unit calculation.
12. Add production security hardening for JWT secret, CORS, rate limits, and callback verification.

## Architectural Decisions To Preserve

- Do not add subscription billing to MVP.
- Keep package pricing in database.
- Keep provider credentials in backend only.
- Keep Angular away from MTN MoMo and SMSOnlineGH APIs.
- Keep all client-owned records scoped with `clientId`.
- Keep wallet operations transactional.
- Keep payment wallet crediting idempotent.
- Keep campaign wallet debiting separate from payment settlement.
- Preserve audit logs for critical actions.

## Mental Model For New Developers

Think of the system as three ledgers/records moving independently but connected by IDs:

1. `Payment`: a client paid money for a package.
2. `WalletTransaction`: the internal SMS balance changed.
3. `Campaign`: SMS units were spent to send messages.

The safe path is:

```txt
SmsPackage -> Payment -> WalletTransaction CREDIT -> Campaign -> WalletTransaction DEBIT -> SMS Provider
```

Avoid shortcuts like:

```txt
Payment -> SMS Provider
```

That shortcut breaks the pay-as-you-go wallet model and makes reporting, idempotency, and refunds/corrections much harder later.
