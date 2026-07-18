# ClearQueue Ticketing System — Backend

TypeScript/Express REST API for the [ClearQueue Ticketing System frontend](https://github.com/SudanBasnet/Ticketing-System-Frontend). The API provides secure authentication, role-based access control, incident and SLA workflows, work notes, service-management records, uploads, email flows, and MongoDB persistence.

## Features

- JWT access tokens and rotating httpOnly refresh cookies
- Token-family revocation when an invalidated refresh token is reused
- Customer, agent, admin, and super-admin authorization rules
- Incident CRUD, filtering, pagination, assignment, ownership, and SLA state
- Customer-visible and internal work notes
- Service requests, problems, changes, CIs, knowledge, activities, and surveys
- Super-admin role and account-status management
- Email verification and password reset flows
- Optional Cloudinary avatars and incident attachments
- Zod validation and consistent API responses
- Helmet, CORS, rate limiting, sanitization, request IDs, and centralized errors
- Jest/Supertest integration coverage

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB 7 or a hosted MongoDB connection string

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The API defaults to `http://localhost:5000`, with health available at `GET /api/health`. The current ClearQueue frontend development proxy targets port `5052`, so use `PORT=5052 npm run dev` when running both repositories without changing the proxy.

> On macOS, port `5000` may be occupied by Control Centre/AirPlay. Choose another `PORT` when necessary and update the frontend Vite proxy target to match.

## Environment

Required variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ticketing_system
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
ACCESS_TOKEN_SECRET=replace-with-at-least-32-characters-access-secret
REFRESH_TOKEN_SECRET=replace-with-at-least-32-characters-refresh-secret
```

Optional configuration supports startup super-admin bootstrapping, SMTP delivery, Cloudinary uploads, password-reset URLs, token TTLs, and cookie domains. See `.env.example` for the complete list and never commit real secrets.

## Demo Data

```bash
npm run seed:demo
```

The repeatable seed only replaces its own tagged demo records and creates a connected ITSM dataset.

```txt
Email: alex.morgan@clearqueue.demo
Password: DemoPassword123!
Role: super_admin
```

These credentials are for local demonstration only.

## Scripts

```bash
npm run dev       # Watch and run the TypeScript API
npm run build     # Compile TypeScript into dist/
npm start         # Run the compiled server
npm run lint      # Type-check without emitting files
npm test          # Build and run Jest integration tests
npm run seed:demo # Load repeatable demonstration data
```

## API Routes

All application endpoints use `/api/v1`.

```txt
/api/v1/auth
/api/v1/users
/api/v1/incidents
/api/v1/incidents/:incidentId/attachments
/api/v1/incidents/:incidentId/work-notes
/api/v1/service-management
```

Service-management record types are `request`, `problem`, `change`, `ci`, `knowledge`, `activity`, and `survey`.

List incidents with `page`, `limit`, `status`, `priority`, `assignedTo`, `createdBy`, `category`, `search`, and `sort` query parameters.

## Response Shape

Successful responses use a consistent envelope:

```json
{
  "success": true,
  "message": "Request completed",
  "data": {},
  "meta": {}
}
```

Errors include a stable status, message, error code, request path, and request ID where applicable.

## Project Structure

```text
src/
├── config/       # Environment and database setup
├── middleware/   # Auth, security, validation, errors, request IDs
├── modules/      # Auth, users, incidents, notes, uploads, service records
├── scripts/      # Repeatable demo seed
├── types/        # Express request augmentation
├── utils/        # Tokens, email, logging, responses, application errors
├── app.ts        # Express composition and routes
└── server.ts     # Database connection and graceful HTTP lifecycle
```

## Docker

The parent workspace includes `docker-compose.yml` for MongoDB and this API:

```bash
cd ..
docker compose up --build
```

## Production Check

```bash
npm run lint
npm run build
npm test
```
