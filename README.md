# Team Task Manager

A full-stack web app for teams to manage tasks collaboratively. Users can register, 
create teams, invite members, and assign tasks with due dates.

## Live Demo

- **Frontend:** https://YOUR-PROJECT.web.app
- **Backend API:** https://YOUR-BACKEND-URL

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, Joi (validation)
- **Auth & DB:** Firebase Authentication + Firestore (both on Google Cloud)
- **Hosting:** Firebase Hosting (frontend), Cloud Run (backend)

## Important Note on Authentication

The assessment spec recommended Passport.js + express-session + PostgreSQL session 
store + bcrypt. I chose **Firebase Authentication + ID tokens** for these reasons:

1. **Equivalent security** — Firebase uses bcrypt/scrypt internally, tokens are 
   signed with RS256, ID tokens are short-lived (1 hour) with automatic refresh.
2. **All on GCP** — Firebase Auth and Firestore are both Google Cloud services, 
   satisfying the "database on GCP" requirement.
3. **Time constraint** — chose to deliver a polished, working product over strict 
   spec adherence within the 72-hour window.

The backend still uses Express, RESTful routes, Joi validation, auth middleware, 
and all other backend requirements. Only the auth mechanism differs.

## Features

- Email/password registration and login
- Create, view, and delete teams (role-based: only creator can delete)
- Invite members by email (stubbed — logs to server console)
- Create, assign, update, and delete tasks
- Filter tasks by team and assignee
- Search tasks by title
- Due date with overdue indicator
- Responsive UI (mobile + desktop)
- Protected routes — auth middleware on all non-auth endpoints

## Project Structure