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
