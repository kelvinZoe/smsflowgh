# API Surface

All routes are prefixed with `/api`.

## Public

- `POST /auth/login`
- `GET /sms-packages`
- `POST /payments/mtn-momo/callback`

## Client Portal

- `GET /wallet/summary`
- `GET /wallet/transactions`
- `POST /payments`
- `GET /payments`
- `POST /payments/:id/verify`
- `GET /contacts`
- `POST /contacts`
- `GET /contact-groups`
- `POST /contact-groups`
- `GET /message-templates`
- `POST /message-templates`
- `GET /sender-ids`
- `POST /sender-ids`
- `GET /campaigns`
- `POST /campaigns`
- `GET /campaigns/:id`
- `GET /reports/dashboard`
- `GET /users`
- `POST /users`

## Super Admin

- `GET /admin/clients`
- `POST /admin/clients`
- `GET /admin/roles`
- `GET /admin/sms-packages`
- `POST /admin/sms-packages`
- `PATCH /admin/sms-packages/:id`
- `POST /admin/wallet/top-up`
- `GET /admin/audit-logs`
