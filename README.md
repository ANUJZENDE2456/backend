# Task API + Minimal Frontend

Backend-first assignment implementing JWT auth, RBAC, and CRUD for tasks. Tech stack: Node.js, Express 5, MongoDB (Mongoose), Swagger, vanilla JS frontend.

## Quick start
- Copy `.env.example` to `.env` and set `JWT_SECRET`, `MONGO_URI` (e.g., local Mongo or Atlas), and `PORT` if needed.
- Install deps: `npm install`
- Run dev server with auto-reload: `npm run dev` (or `npm start`).
- Open http://localhost:4000 for the UI; Swagger docs live at http://localhost:4000/api-docs.

## API (base `/api/v1`)
- `POST /auth/register` – create user (role defaults to `user`; set `admin` manually here if needed).
- `POST /auth/login` – get JWT.
- `GET /tasks` – list tasks (admin = all, user = own).
- `POST /tasks` – create task.
- `GET /tasks/:id` – fetch one.
- `PUT /tasks/:id` – update fields.
- `DELETE /tasks/:id` – delete.
- `GET /health` – uptime probe.

Headers: `Authorization: Bearer <token>`. Tokens expire in 1h by default.

## Data model (MongoDB)
- `users(name, email, passwordHash, role, createdAt, updatedAt)`
- `tasks(title, description, status, owner -> users._id, createdAt, updatedAt)`

## Validation & security
- Password hashing via `bcryptjs`; JWT via `HS256`.
- Input validation/sanitization: `express-validator`; centralized error handler.
- Helmet + CORS + JSON size limit; role checks on all task routes.
- Static frontend served from `public/`; no secrets stored in UI (token kept in `localStorage`).

## Frontend
Single-page vanilla JS in `public/index.html`:
- Register/login forms, token-aware status pill.
- Create task, list tasks, mark done, delete.
- Inline log panel showing API responses for quick debugging.

## Docs
Swagger UI at `/api-docs` (OpenAPI 3 via swagger-jsdoc annotations in route files).

## Scalability notes
- Swap SQLite for Postgres/MySQL by replacing `better-sqlite3` with a pool/ORM; schema is already normalized.
- Add Redis for session blacklist/rate limiting and caching task lists.
- Containerize with a simple `Dockerfile`, add CI to run lint/tests, and expose port 4000 behind a reverse proxy (Nginx) with TLS.
- Break out domains (`users`, `tasks`) into separate modules/services when feature set grows; events or a queue (RabbitMQ/Kafka) can decouple side effects.
