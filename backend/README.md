# Backend - AI Personalized Study Planner

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and fill values.
3. Run in development:
   ```bash
   npm run dev
   ```
4. Run in production:
   ```bash
   npm start
   ```

## API Base URL

`http://localhost:5000/api`

## Notes

- Uses JWT auth (`24h` expiry by default).
- Uses MongoDB Atlas via `MONGO_URI`.
- Cron job checks every 15 minutes and sends reminders at each user's local 7:00 PM.
- Missed tasks are auto-carried when schedule recalculation runs.

> **Migration note:** starting 2026‑02‑24 the backend enforces unique topic titles per user & subject.  A compound unique index (`userId, subjectId, title`) with case‑insensitive collation was added.  Before deploying, ensure there are no duplicate topics for the same subject (remove or rename them) or the server will fail with duplicate key errors.
