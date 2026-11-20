# Project Management Tool (PM‑Tool)

## Overview
A modern, full‑stack project management application with a Kanban board, real‑time collaboration, notifications, and a clean design system based on **Tailwind CSS**, **Indigo/Slate** palette, and **Inter** font. Users can create projects, manage tasks, comment, and work together in real time.

## Features
- **Responsive UI** – mobile (375 px), tablet, desktop layouts.
- **Dark mode** – persisted across sessions.
- **Kanban board** – drag‑and‑drop columns & tasks (dnd‑kit).
- **Task Modal** – edit details, assign members, add labels, comments.
- **Members panel** – invite, remove, or leave a project.
- **Project settings** – rename or delete a project.
- **Real‑time** – Socket.IO for tasks, comments, members, and notifications.
- **Notifications** – assignment, @‑mentions, project invites; unread count in bell.
- **Authentication** – JWT, protected routes, rate limiting.
- **API** – RESTful endpoints for auth, users, projects, tasks, comments, notifications.
- **Testing** – Jest + Supertest covering auth, projects, tasks.
- **Seed data** – demo users (Alice, Bob) with a sample project.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Front‑end | React 18, Vite, Tailwind CSS, lucide‑react, dnd‑kit, Socket.IO client |
| Back‑end | Node 20, Express, MongoDB (Atlas), Mongoose, Socket.IO server |
| Auth | JWT (jsonwebtokens) |
| Testing | Jest, Supertest |
| Dev tools | Concurrently, ESLint, Prettier |

## Architecture Diagram
```mermaid
flowchart TD
    subgraph Client [Client (React)]
        A[UI Components] --> B[Pages]
        B --> C[SocketContext]
        C --> D[Socket.IO client]
        B --> E[API Service (axios)]
    end
    subgraph Server [Server (Express)]
        F[Routes] --> G[Controllers]
        G --> H[Models (Mongoose)]
        G --> I[Socket.IO server]
        I -->|emit| J[Clients]
        F --> K[Auth Middleware (JWT)]
        K --> G
    end
    A -->|fetch| E
    E -->|HTTP| F
    D -->|WebSocket| I
    style Client fill:#e0f7fa,stroke:#006064,stroke-width:2px
    style Server fill:#fff3e0,stroke:#bf360c,stroke-width:2px
```

## Setup
1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <repo-root>
   ```
2. **Create environment files**
   - `server/.env.example` → copy to `server/.env` and fill values.
   - `client/.env.example` → copy to `client/.env` and fill values.
3. **Install dependencies**
   ```bash
   npm install               # installs root dev deps (concurrently)
   npm install --prefix server
   npm install --prefix client
   ```
4. **Seed the database** (requires MongoDB connection string in `server/.env`)
   ```bash
   npm run seed --prefix server
   ```
   This creates demo users **Alice** and **Bob** (password `password123`).
5. **Run the apps**
   ```bash
   npm run dev   # runs server and client concurrently
   ```
   The client will be available at `http://localhost:5173` and the API at `http://localhost:5000`.
6. **Run tests**
   ```bash
   npm test --prefix server   # Jest + Supertest
   ```

## Environment Variables
### Server (`server/.env.example`)
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pmtool?
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
```
### Client (`client/.env.example`)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
> Both `.env` files are listed in `.gitignore` and will never be committed.

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:projectId/tasks` | Create task |
| GET | `/api/projects/:projectId/tasks` | List tasks (with optional filters) |
| PUT | `/api/tasks/:id` | Update task fields |
| PATCH | `/api/tasks/:id/move` | Move/reorder task |
| PATCH | `/api/tasks/:id/assign` | Assign users to task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:taskId/comments` | Add comment |
| GET | `/api/tasks/:taskId/comments` | List comments |
| PATCH | `/api/comments/:id` | Edit comment |
| DELETE | `/api/comments/:id` | Delete comment |
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| PATCH | `/api/notifications/read‑all` | Mark all as read |

## Socket.IO Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `join` | client → server | `{ projectId }` – joins a project room |
| `task_created` | server → client | Task object |
| `task_updated` | server → client | Task object |
| `task_deleted` | server → client | `{ taskId }` |
| `task_moved` | server → client | Task object |
| `comment_created` | server → client | Comment object |
| `notification` | server → client | Notification object (target user only) |
| `member_added` | server → client | Member object |
| `member_removed` | server → client | `{ memberId }` |

## Demo Credentials
| User | Email | Password |
|------|-------|----------|
| Alice | alice@example.com | password123 |
| Bob | bob@example.com | password123 |

## Screenshots
_Images are stored in `docs/screenshots`._
- **Landing page** – `docs/screenshots/landing.png`
- **Kanban board (dark mode)** – `docs/screenshots/board-dark.png`
- **Task modal** – `docs/screenshots/task-modal.png`
- **Notifications dropdown** – `docs/screenshots/notifications.png`
- **Profile page** – `docs/screenshots/profile.png`

---
*Built with ❤️ using the Antigravity ecosystem.*