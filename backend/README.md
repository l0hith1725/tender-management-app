# Tender Management Backend (thin proxy)

This backend is intentionally thin: it calls stored procedures and views from `tender_management_system_complete.sql`. All business logic, validation and error messages must live in the SQL file.

Quick start (local):

1. Import the SQL file into your MySQL server first (required):

   mysql -u <user> -p < /path/to/tender_management_system_complete.sql

2. Copy `.env.example` to `.env` and fill the database credentials and `JWT_SECRET`.

3. Install dependencies and start the dev server:

```bash
cd backend
npm install
npm run dev
```

Endpoints of interest:
- `POST /api/auth/login` (calls SQL login procedure)
- `POST /api/auth/register` (calls SQL register procedure)
- `GET /api/auth/me`
- `GET /api/tenders/open` (reads view `active_tenders_view`)

Notes:
- The app expects the stored procedures `sp_register_user` and `sp_login_user` (or equivalent) to exist in the imported SQL.
- The backend will surface SQL error messages returned in result rows as JSON `{ error: <message> }`.
