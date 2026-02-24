# AI Personalized Study Planner (MERN)

A full-stack MERN application with a mobile-only frontend for personalized exam study scheduling.

## Stack

- Frontend: React (Vite) + Tailwind CSS + React Router + Axios + Chart.js
- Backend: Node.js + Express + Mongoose + JWT + bcryptjs + Nodemailer + node-cron
- Database: MongoDB Atlas

## Key Features

- Authentication: register, login, protected routes (JWT)
- **Exam-oriented workflow** – create exams with name/date, then add subjects under each exam, and topics (sub‑topics) within subjects. Subjects are linked to an exam. 
- Subject and topic management with strength labels (`weak`, `normal`, `strong`)
- Study plan generation and recalculation with weighted scheduler
- Revision task insertion every 5th day
- Dashboard for today tasks, completion tracking, and streak
- Analytics: progress line chart, weak-coverage pie chart, readiness score
- Email reminders at 7 PM user local time, motivational message if tasks were missed
- Mobile-only UI (`max-width: 430px`), desktop message shown above 768px

## Folder Structure

```text
backend/
frontend/
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Required `backend/.env` values:

- `PORT=5000`
- `MONGO_URI=`
- `JWT_SECRET=`
- `JWT_EXPIRES_IN=24h`
- `CLIENT_URL=http://localhost:5173`
- `SMTP_HOST=`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=`
- `SMTP_PASS=`
- `MAIL_FROM=`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Required `frontend/.env` values:

- `VITE_API_BASE_URL=http://localhost:5000/api`

## Run Independently

- Backend runs independently on port `5000`
- Frontend runs independently on port `5173`

Start each in separate terminals.

## Mobile-only Rule

The frontend includes CSS to hide app content on screens wider than `768px` and show:

`This app is optimized for mobile devices only.`

## Default Scheduler Rules

- `weak = 1.5`
- `normal = 1`
- `strong = 0.8`
- Revision inserted every 5th day
- Missed day triggers automatic recalculation on next app open/dashboard fetch

## Readiness Formula

```text
readiness = (completion * 0.5) + (weakCoverage * 0.3) + (streakConsistency * 0.2)
```
