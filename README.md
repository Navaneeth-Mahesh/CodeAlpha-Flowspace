# Flowspace

A project management app (Trello/Asana/Linear-inspired) — React + TypeScript frontend, Express +
MongoDB Atlas backend, real-time updates via Socket.IO.

```
flowspace/
  frontend/   React 19 + Vite + TypeScript + Tailwind CSS v4
  backend/    Node + Express + Mongoose + MongoDB Atlas + Socket.IO + JWT
```

## What's included

- **Auth**: register / login / logout, JWT-based sessions, forgot/reset password (email-link based,
  no OTP step — registering drops you straight into onboarding).
- **Projects**: create, edit, archive/restore, duplicate, favorite, per-project visibility, member
  invites by email. **A project's members list only ever contains people who were explicitly
  invited to it** — there's no directory of other users to browse, and a brand-new account starts
  with zero projects, zero teammates, and zero tasks. Inviting an email that doesn't have an account
  yet stores a pending invite that resolves automatically the moment that person registers.
- **Tasks**: full CRUD, priority, labels, due dates, checklists, assignees, comments with @mentions
  and emoji reactions, activity history, archive/duplicate.
- **Views**: Kanban board (drag-and-drop via dnd-kit), List, Table (sortable), and Calendar (month
  grid). All four read from the same task data, live-updated over Socket.IO.
- **Notifications**: real-time, backed by MongoDB, covering task assignment, status changes, task
  completion, comments, mentions, and project invites.
- **Search**: a Cmd/Ctrl+K command palette searching your projects and tasks.
- **Settings**: profile, appearance (theme), security (password change), notification preferences.
- **Design system**: "Signal & Slate" — dark/light themes, neumorphic + glass surface treatments,
  a custom "F" monogram mark (not a stock icon).

## What's intentionally simplified (be aware before demoing)

- Calendar is a month-grid of due dates, not a full drag-to-reschedule calendar.
- No Timeline/Gantt view, no task dependencies, no recurring tasks yet.
- Reports/analytics charts aren't built yet (Recharts is installed and ready for this).
- Password reset emails require SMTP credentials in `backend/.env`; without them, the reset link is
  printed to the backend console (and returned in the API response in non-production mode) so the
  flow is still fully testable locally.
- "API Keys" and "Billing" panels from the original spec were intentionally left out rather than
  built as inert placeholders — happy to add them (as UI-only, per the original spec) on request.

## Getting started

### 1. MongoDB Atlas

Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), create a database user,
and allow network access from your IP (or `0.0.0.0/0` for local dev). Copy the connection string —
you'll need it for `backend/.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env — paste your MONGODB_URI, generate a JWT_SECRET:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm install
npm run dev
```

Open the printed local URL, register an account, and you're in.

## Where things live

See `frontend/README.md` and the inline comments in `backend/src` — routes, controllers, and models
are grouped by feature (auth, projects, tasks, comments, notifications, users).

## Tech stack

**Frontend**: React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router v7, React Hook Form
+ Zod, Framer Motion, dnd-kit, date-fns, Axios, Socket.IO client.

**Backend**: Node.js, Express, Mongoose, MongoDB Atlas, JWT, bcrypt, Socket.IO, Nodemailer
(optional), express-rate-limit.
