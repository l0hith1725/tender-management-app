# How to run and test this Tender Management app

This file explains, step-by-step, how to start the project, import the database, run backend and frontend, and exercise the main bidder flows (login, register for a tender, submit a bid). It also covers common troubleshooting steps.

## Overview
- Backend: Node/Express (located in `backend/`). Uses MySQL (database name: `tender_management_system` by default).
- Frontend: (if present) in `frontend/` (Vite/React in this repo).
- Database schema and seed data: `tender_management_system_complete.sql` at the repo root.

## Prerequisites
- Node.js (v16+ recommended)
- npm (or pnpm/yarn)
- MySQL server (5.7+ or 8.x)
- Git (to clone repo)

## 1) Clone repository (if not already)

```bash
git clone <repo-url> tender-management-app
cd tender-management-app
```

## 2) Import the database

1. Create database (if not already present) and import schema + seed data:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tender_management_system;"
mysql -u root -p tender_management_system < tender_management_system_complete.sql
```

2. If your MySQL user is not `root`, replace `-u root -p` with credentials for your DB user. The SQL file creates tables and inserts sample data (bidders, tenders, participation, etc.).

## 3) Backend setup

1. Change into backend folder and install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` (or set environment variables) — example:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tender_management_system
JWT_SECRET=dev_secret
FRONTEND_ORIGIN=http://localhost:5173
PORT=4000
```

3. Start backend (dev mode):

```bash
npm run dev
```

- The server will listen on `http://localhost:4000` by default.
- If you see `Error: listen EADDRINUSE: address already in use :::4000`, another process is using port 4000. Find and stop it:

```bash
lsof -iTCP:4000 -sTCP:LISTEN -n -P
kill -9 <PID>
```

- If you get a message `multer not available; upload endpoints will return a 503 error`, install multer in backend:

```bash
npm install multer --save
```

## 4) Frontend setup (if present)

```bash
cd frontend
npm install
npm run dev
```

Default frontend dev origin used in backend CORS: `http://localhost:5173`.

## 5) Authentication and test accounts

The SQL/README ships with test user credentials. One of the sample users is:

- username: `bidder_test`
- password: `password123`
- role: `bidder`

Login endpoint (cookie-based JWT):

```bash
# Save cookies to /tmp/tender_cookies
curl -i -c /tmp/tender_cookies -H "Content-Type: application/json" \
  -d '{"username":"bidder_test","password":"password123"}' \
  http://localhost:4000/api/auth/login
```

This will set an httpOnly cookie named `token` used for subsequent authenticated requests.

## 6) Register for a tender (bidder flow)

- Register for tender (tender id 1) using the saved cookie:

```bash
curl -i -b /tmp/tender_cookies -X POST http://localhost:4000/api/bids/1/register
```

Notes:
- If the backend cannot map the logged-in user to a `BIDDER.Bidder_ID`, you may get an error telling you to create a bidder profile first. See the "Mapping users ↔ bidders" section below for more details.
- As a workaround you can pass `bidderId` explicitly in the request body (must be a valid `BIDDER.Bidder_ID`):

```bash
curl -i -b /tmp/tender_cookies -H "Content-Type: application/json" \
  -d '{"bidderId": 2}' -X POST http://localhost:4000/api/bids/1/register
```

## 7) Submit a bid

```bash
curl -i -b /tmp/tender_cookies -H "Content-Type: application/json" \
  -d '{"bidAmount": 5000000, "emdSubmitted": true, "documentsAttached": true}' \
  -X POST http://localhost:4000/api/bids/1/bid
```

## 8) Check My Bids

```bash
curl -i -b /tmp/tender_cookies http://localhost:4000/api/bids/my-bids
```

## 9) Inspect DB to confirm registration / bids

```bash
# show bidder participation for tender 1
mysql -u root -p -D tender_management_system -e "SELECT * FROM BIDDER_TENDER_PARTICIPATION WHERE Tender_ID = 1;"

# show bidders
mysql -u root -p -D tender_management_system -e "SELECT Bidder_ID, Company_Name, Email FROM BIDDER LIMIT 50;"
```

## 10) Mapping users ↔ bidders (important note)

- The application separates `USERS` (authentication/accounts) and `BIDDER` (company profiles). Historically the backend used `req.user.id` (the `USERS.User_ID`) as a `Bidder_ID`, which caused a foreign key error when the values didn't match the `BIDDER` primary key.

- To reduce that error, the backend now attempts to resolve the correct `Bidder_ID` by looking up the `BIDDER` table by email (using `req.user.username`) when `bidderId` is not provided in the request body. This logic lives in `backend/src/controllers/bidsController.js`.

- If you plan to use the app in production, consider one of these long-term fixes:
  - Add `Bidder_ID` column to `USERS` and populate it when a bidder account/profile is created.
  - Make bidder profile creation part of user signup for role `bidder` and return the new `Bidder_ID`.
  - Use an explicit admin flow to link `USERS` rows to `BIDDER` rows.

## 11) Troubleshooting tips

- "EADDRINUSE" (port in use): find process with `lsof` and kill it.
- "multer not available": `npm install multer --save` inside `backend/`.
- Login returns 200 with `{ user: null }` or returns no cookie:
  - The auth middleware returns `user: null` for missing/invalid tokens. Use the login endpoint to get a fresh token cookie.
  - Verify the cookie was set by inspecting the response headers from the login curl.
- Foreign Key error when registering: ensure the `bidderId` passed maps to an existing `BIDDER.Bidder_ID`. Use the explicit `bidderId` workaround or create a corresponding `BIDDER` row.

## 12) Useful DB queries

- List users:

```sql
SELECT User_ID, Username, Role FROM USERS LIMIT 50;
```

- Find bidder by email:

```sql
SELECT Bidder_ID, Company_Name, Email FROM BIDDER WHERE Email = 'bidder_test' LIMIT 1;
```

## 13) Development notes / next improvements

- Implement server-side session allowlist (jti) or sessions table for immediate token revocation.
- Add DB migration to add `USERS.Bidder_ID` and set up application logic to create and link `BIDDER` rows when users are created with role `bidder`.
- Add integration tests covering register/submit-bid flows to catch FK errors early.

---

If you want, I can also:
- Add a `README.md` instead of this `HOW_TO_RUN.md` and wire a `make` or `npm` script to automate DB import and start-up.
- Add a small script `scripts/bootstrap.sh` that imports DB and seeds test data automatically and prints credentials.

Tell me which of these extras you'd like and I will add them next.
