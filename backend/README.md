# Flowspace — Backend

Express + MongoDB Atlas API for Flowspace.

## Setup

```bash
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev             # nodemon, restarts on file changes
```

`GET /api/health` should return `{ status: "ok" }` once it's running.

## Environment variables

See `.env.example` for the full list. At minimum you need `MONGODB_URI` (from MongoDB Atlas) and
`JWT_SECRET` (any long random string). SMTP variables are optional — without them, password-reset
links are printed to the console instead of emailed, so the flow still works end-to-end locally.

## API routes

**Auth** (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create account, auto-joins any project that pre-invited this email |
| POST | `/login` | – | Returns `{ token, user }` |
| GET | `/me` | ✓ | Current user |
| PATCH | `/profile` | ✓ | Update name/bio/jobTitle/timezone/notificationPrefs |
| PATCH | `/password` | ✓ | Change password |
| POST | `/forgot-password` | – | Sends (or logs) a reset link |
| POST | `/reset-password` | – | Consumes the reset token |

**Projects** (`/api/projects`)
| Method | Path | Description |
|---|---|---|
| GET | `/?archived=&favorite=` | List your projects |
| POST | `/` | Create |
| GET / PATCH / DELETE | `/:id` | Read / update / permanently delete (owner only) |
| PATCH | `/:id/archive` | Archive or restore |
| PATCH | `/:id/favorite` | Toggle favorite |
| POST | `/:id/duplicate` | Duplicate structure |
| POST | `/:id/invite` | Invite by email (adds immediately or queues a pending invite) |
| PATCH / DELETE | `/:id/members/:userId` | Change role / remove member |
| DELETE | `/:id/invites/:email` | Cancel a pending invite |
| GET / POST | `/:projectId/tasks` | List / create tasks in a project |

**Tasks** (`/api/tasks`)
| Method | Path | Description |
|---|---|---|
| GET | `/mine` | Tasks assigned to you, across all projects |
| GET | `/search?q=` | Search tasks by title across your projects |
| GET / PATCH / DELETE | `/:id` | Read / update (status, assignees, etc.) / delete |
| PATCH | `/:id/archive` | Archive or restore |
| POST | `/:id/duplicate` | Duplicate |
| POST / PATCH / DELETE | `/:id/checklist(/:itemId)` | Manage checklist items |
| GET / POST | `/:taskId/comments` | List / add comments |

**Comments** (`/api/comments`) — edit, delete, toggle a reaction.

**Notifications** (`/api/notifications`) — list, mark one/all read.

**Users** (`/api/users`) — `/lookup?email=` (exact match, for invites), `/collaborators?projectId=&q=`
(people you already share a project with, for @mentions and assignee pickers).

## Real-time events (Socket.IO)

Clients connect with `{ auth: { token } }` and are auto-joined to a `user:<id>` room.
- `notification:new` — pushed to the recipient's room whenever a notification is created.
- `task:created` / `task:updated` / `task:deleted` — pushed to `project:<id>` rooms (join via the
  `project:join` event after loading a project).
- `comment:new` — pushed to `project:<id>` rooms.
