# Team Task Manager

A full-stack web application for teams to manage tasks collaboratively. Users can
register, create teams, invite members, and create/assign/track tasks with due dates,
filtering by team or assignee.

## Live Demo

- **Frontend:** https://YOUR-PROJECT.web.app
- **Backend API:** https://YOUR-BACKEND-URL

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, Passport.js (LocalStrategy), bcrypt, Joi
- **Database:** PostgreSQL (hosted on Neon / Google Cloud)
- **Sessions:** express-session with connect-pg-simple (stored in PostgreSQL)
- **Hosting:** Firebase Hosting (frontend), Cloud Run (backend)

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
- Responsive UI (mobile + desktop)

## Project Structure

```
Team-Task-Manager/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── pages/          # Login, Register, Dashboard
│       ├── components/     # TeamSidebar, TaskBoard, TaskModal
│       ├── context/        # AuthContext
│       ├── api.js          # axios instance (withCredentials)
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

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs at http://localhost:5173

## API Endpoints

All non-auth routes require an authenticated session (cookie sent automatically).

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

- **Frontend:** `npm run build`, deployed to Firebase Hosting
- **Backend:** Dockerized, deployed to Google Cloud Run with the same env vars
