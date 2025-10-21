# TeamCollab Hub

TeamCollab Hub is a collaborative workspace for planning events, managing tasks and coordinating teams. This repository now contains both the Vite/React front-end and a Spring Boot + PostgreSQL back-end so that the application can be run end‑to‑end locally.

## Project structure

```
.
├── backend/               # Spring Boot project (Maven)
├── public/                # Static assets for the React front-end
├── src/                   # Front-end source code
├── docker-compose.yml     # Local PostgreSQL service
└── README.md
```

## Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.9+
- Docker (optional, for running PostgreSQL via `docker-compose`)

## Running the application locally

### 1. Start PostgreSQL

The backend expects a PostgreSQL database. The easiest way to start one is with Docker:

```bash
docker compose up -d
```

This launches a `postgres:15` container that listens on `localhost:5432` and creates a database named `teamcollab` with the credentials `teamcollab/teamcollab`.

> If you prefer to use an existing PostgreSQL instance, set the environment variables described in the [Configuration](#configuration) section instead of running Docker.

### 2. Start the Spring Boot back-end

```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api` and provides endpoints for authentication, users, events, columns, tasks and chats. JWT-based authentication is enabled; after registering or logging in, include the `Authorization: Bearer <token>` header in subsequent requests.

### 3. Start the React front-end

```bash
cd ..
npm install
npm run dev
```

Vite serves the front-end on `http://localhost:5173`. The front-end is already configured to call the back-end at `http://localhost:8080/api` and will automatically include the JWT token stored in `localStorage`.

## Configuration

The Spring Boot application reads the following environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/teamcollab` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `teamcollab` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `teamcollab` |
| `APP_SECURITY_JWT_SECRET` | Base64 encoded secret for JWT signing | Pre-configured development secret |
| `APP_SECURITY_JWT_EXPIRATION` | Token lifetime in milliseconds | `86400000` (24 hours) |

Override them when running `mvn spring-boot:run`, e.g.:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/teamcollab \
SPRING_DATASOURCE_USERNAME=myuser \
SPRING_DATASOURCE_PASSWORD=mypassword \
APP_SECURITY_JWT_SECRET=$(openssl rand -base64 64) \
mvn spring-boot:run
```

## API overview

All endpoints are served under the `/api` prefix.

- `POST /auth/register` – create a new user and receive a JWT
- `POST /auth/login` – authenticate and receive a JWT
- `GET /auth/me` – retrieve the currently authenticated user
- `POST /auth/logout` – stateless logout endpoint
- CRUD endpoints for `/users`, `/events`, `/columns`, `/tasks`
- Chat management endpoints under `/chats` with nested `/messages`

Swagger/OpenAPI is not included yet, but the front-end services in `src/api/services` demonstrate how each route is consumed.

## Database schema

Entities are managed with JPA/Hibernate. The most important tables are:

- `users` – stores profile data, hashed passwords and counters
- `events` – top-level planning context
- `columns` – Kanban columns within an event
- `tasks` – tasks linked to an event/column, with priority, status and assignees
- `chats`, `chat_participants`, `chat_messages` – simple team chat implementation

Hibernate automatically creates and updates the schema (`spring.jpa.hibernate.ddl-auto=update`). For production you should replace this with explicit migrations (Flyway or Liquibase).

## Development tips

- The JWT token is persisted in `localStorage` under the `token` key; clearing browser storage will log you out.
- CORS is configured to allow requests from `http://localhost:5173`. Adjust `SecurityConfig` if you host the front-end elsewhere.
- Passwords are hashed with BCrypt; there is no password reset flow yet.

## Testing

The repository currently has no automated test suite. You can add unit and integration tests in the `backend/src/test/java` tree and front-end tests with Vitest or Jest as needed.

## License

This project does not include an explicit license. Please add one if you plan to distribute the application.
