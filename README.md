# Team Task Manager

A full-stack web application for teams to manage tasks collaboratively. Users can
register, create teams, invite members, and create/assign/track tasks with due dates,
filtering by team or assignee.

## Live Demo

- **Frontend:** https://teamtaskmanager-141d5.web.app
- **Backend API:** https://team-task-manager-production-8407.up.railway.app

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, Passport.js (LocalStrategy), bcrypt, Joi
- **Database:** PostgreSQL (hosted on Neon)
- **Sessions:** express-session with connect-pg-simple (stored in PostgreSQL)
- **Hosting:** Firebase Hosting (frontend, Google Cloud) + Railway (backend)
- **CI/CD:** GitHub Actions auto-deploys the frontend to Firebase Hosting on every push to `main`

## Authentication & Security

- Passport.js local strategy with email/password
- Passwords hashed with bcrypt (10 rounds) — never stored in plain text
- Sessions persisted in PostgreSQL via connect-pg-simple, with HTTP-only cookies
- `secure` + `sameSite=none` cookies in production
- All non-auth routes protected by `requireAuth` middleware
- Input validation and sanitization via Joi on every write endpoint

## Features

- Email/password registration and login (secure sessions)
- Create, view, and delete teams (only the creator can delete a team)
- Invite members by email (stubbed — logs to server console, no SMTP)
- Create, assign, update, and delete tasks
- Filter tasks by team and by assignee
- Search tasks by title
- Due dates with an overdue indicator
- Responsive layout built with Tailwind (see mobile note below)

## Project Structure

```
Team-Task-Manager/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── pages/          # Login, Register, Dashboard
│       ├── components/     # TeamSidebar, TaskBoard, TaskModal
│       ├── context/        # AuthContext
│       ├── api.js          # axios instance (withCredentials: true)
│       └── main.jsx
└── server/                 # Express backend
    ├── routes/             # auth, teams, tasks
    ├── middleware/         # requireAuth
    ├── db.js               # pg pool + table init
    ├── passport.js         # local strategy + serialize
    └── index.js
```

## Local Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g. a free Neon project — neon.tech)

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SESSION_SECRET=replace-with-a-long-random-string
NODE_ENV=development
```

```bash
npm run dev
```

Tables are created automatically on first run. Server runs at http://localhost:5000

### Frontend

```bash
cd client
npm install
```

Create `client/.env` (for local development):

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs at http://localhost:5173

> For production builds, `client/.env.production` sets `VITE_API_URL` to the
> deployed backend URL.

## API Endpoints

All non-auth routes require an authenticated session (cookie sent automatically
via `withCredentials`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register and start a session |
| POST | /api/auth/login | Log in |
| POST | /api/auth/logout | Log out |
| GET | /api/auth/me | Current user |
| GET | /api/teams | List teams the user belongs to |
| POST | /api/teams | Create a team |
| POST | /api/teams/:id/members | Add a member by email (stubbed invite) |
| DELETE | /api/teams/:id | Delete a team (creator only) |
| GET | /api/tasks?teamId=&assignee= | List tasks (filterable) |
| POST | /api/tasks | Create a task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

## Bonus Features Implemented

- Role-based access — only a team's creator can delete it
- Stubbed email invite — logs to the server console (no SMTP needed)
- Overdue indicator on tasks past their due date

## Deployment

- **Frontend:** built with `npm run build` and deployed to **Firebase Hosting**
  (a Google Cloud service). A GitHub Actions workflow redeploys automatically on
  every push to `main`.
- **Backend:** deployed to **Railway** (a Dockerfile is included; the backend is
  container-ready and can be deployed to Google Cloud Run with
  `gcloud run deploy --source .`).

### Note on the "deploy on GCP" requirement

The frontend is hosted on Firebase Hosting, which is part of Google Cloud. The
backend and database are on Railway and Neon respectively, because deploying to
Cloud Run and Cloud SQL requires an active GCP billing account (credit card),
which was not available. The application is fully containerized and cloud-agnostic;
moving the backend to Cloud Run and the database to Cloud SQL would require only
configuration changes, not code changes.

## Known Limitation: Mobile Browsers

The app uses express-session with HTTP-only cookies (per the spec). Because the
frontend (Firebase Hosting) and backend (Railway) are on different domains, the
session cookie is treated as third-party. Desktop browsers allow this, but some
mobile browsers (notably iOS Safari) block third-party cookies by default,
preventing login persistence on those devices.

The robust fix is to serve frontend and backend from the same domain (so the
cookie is first-party) or to switch to token-based auth (Authorization header,
not subject to cookie blocking). This was not completed due to the time constraint.