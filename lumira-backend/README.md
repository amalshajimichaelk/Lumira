# ⚡ Lumira Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 20">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render">
</p>

<p align="center">
  <i>Production-ready REST API for the Lumira Healthcare Analytics Dashboard — deployed to Render with JWT authentication, Prisma ORM, and comprehensive analytics endpoints.</i>
</p>

---

Lumira Backend is a fully typed Express.js + TypeScript REST API powering the Lumira Healthcare Analytics Dashboard. It provides secure, rate-limited endpoints for patient visit tracking, doctor workload analysis, departmental performance metrics, revenue analytics, and appointment scheduling. Designed for healthcare operations teams, it integrates a Render Managed PostgreSQL database and uses JWT access + refresh token rotation for stateless, secure authentication.

---

## ✨ Key Features

* **Authentication & Security:**
    * JWT access tokens (15 min) + hashed refresh tokens (7 days, httpOnly cookie)
    * Token rotation on every refresh; all sessions invalidated on password change
    * bcrypt with 12 salt rounds; timing-attack-safe login
    * Helmet (CSP, HSTS, X-Frame-Options), CORS with credentials, global rate limiting
* **Analytics Endpoints:**
    * Dashboard summary with 7-day sparklines (cached 60s via node-cache)
    * Department performance with revenue share calculation
    * Doctor workload as % of daily capacity
    * Revenue grouped by day/month/year via PostgreSQL `DATE_TRUNC`
    * Appointment calendar view (date → count map)
* **Data Management:**
    * Paginated patient visits with multi-filter support (department, date range, status)
    * CSV export (ADMIN only) via json2csv with `Content-Disposition` header
    * Appointment clash detection; auto-creates Visit + RevenueRecord on COMPLETED status
    * Zod validation on all request bodies and query parameters
* **Production Ready:**
    * `render.yaml` infrastructure-as-code for zero-config Render deployment
    * Graceful shutdown (SIGTERM/SIGINT), Prisma singleton, Winston structured logging
    * Global error handler mapping Zod/Prisma/JWT errors to consistent JSON responses
    * Health check endpoint with live DB connectivity verification

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Runtime** | Node.js 20 LTS |
| **Framework** | Express.js v4 |
| **Language** | TypeScript 5.6 (compiled to CommonJS) |
| **Database** | PostgreSQL 16 (Render Managed) |
| **ORM** | Prisma v5 |
| **Authentication** | JWT + Refresh Tokens (jsonwebtoken, bcrypt) |
| **Validation** | Zod v3 |
| **Caching** | node-cache (in-memory, TTL 60s) |
| **Rate Limiting** | express-rate-limit |
| **Logging** | Morgan (HTTP) + Winston (application) |
| **CSV Export** | json2csv |
| **Deployment** | Render Web Service |

---

## 🏛️ Architecture

This project is structured as a **modular monolith**, utilizing a feature-based module organization with clear separation of concerns across layers.

* **Config Layer (`src/config/`):** Env validation (Zod), Prisma singleton, node-cache singleton — imported by all modules.
* **Middleware Layer (`src/middleware/`):** Authentication, role-based authorization, Zod validation wrapper, global error handler.
* **Module Layer (`src/modules/`):** Each business domain (auth, dashboard, patients, doctors, departments, revenue, appointments) owns its routes, controller, service, and schema.
* **Utils Layer (`src/utils/`):** JWT helpers, standardized response wrappers, pagination, logger.

---

## 🗄️ Database Setup

PostgreSQL 16 via Render Managed PostgreSQL. Prisma handles schema migrations.

1. Ensure your `.env` contains:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/Lumira?schema=public
   ```
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Seed the database (6 departments, 20 doctors, 100 patients, 500 appointments):
   ```bash
   npm run db:seed
   ```
   Default admin credentials: `admin@Lumira.com` / `Admin@1234`

---

## 🚀 How to Run

### Prerequisites

1. **Node.js 20+:** Ensure you have Node.js 20 LTS installed.
2. **PostgreSQL:** A running PostgreSQL 16 instance (local or Render).

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Lumira-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT secrets
   ```

4. **Run migrations + seed:**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   API available at `http://localhost:5000`

### Production Build (Render)

Render runs automatically via `render.yaml`:
```
Build: npm install && npm run build && npm run db:migrate
Start: npm run start
```

---

## 📂 Project Structure

```
Lumira-backend/
├── prisma/
│   ├── schema.prisma          # Full database schema (8 models, 5 enums)
│   └── seed.ts                # Comprehensive seed (100 patients, 500 appointments)
├── src/
│   ├── server.ts              # Entry point, health check, graceful shutdown
│   ├── app.ts                 # Express app factory, middleware stack, route mounting
│   ├── config/
│   │   ├── env.ts             # Zod env validation (exits on startup if invalid)
│   │   ├── database.ts        # Prisma client singleton
│   │   └── cache.ts           # node-cache singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts         # JWT verification → req.user
│   │   ├── role.middleware.ts         # requireRole('ADMIN', 'DOCTOR')
│   │   ├── validate.middleware.ts     # Zod body/query validation wrapper
│   │   ├── errorHandler.middleware.ts # Global error handler
│   │   └── notFound.middleware.ts     # 404 catch-all
│   ├── modules/
│   │   ├── auth/              # Login, refresh, logout, profile, change-password
│   │   ├── dashboard/         # Summary with sparklines (cached)
│   │   ├── patients/          # Visits list, CSV export, patient profile
│   │   ├── doctors/           # Doctor list, workload percentage
│   │   ├── departments/       # Performance metrics, revenue share
│   │   ├── revenue/           # Grouped revenue, breakdown by dept/payment
│   │   └── appointments/      # CRUD, calendar view, clash detection
│   ├── types/
│   │   └── index.ts           # Express.Request.user augmentation
│   └── utils/
│       ├── jwt.utils.ts       # sign/verify access + refresh tokens
│       ├── response.utils.ts  # sendSuccess, sendPaginated, sendError
│       ├── pagination.utils.ts# paginate() → Prisma skip/take
│       └── logger.ts          # Winston (JSON in prod, colorized in dev)
├── tsconfig.json
├── .env.example
├── render.yaml                # Render IaC: web service + managed PostgreSQL
└── README.md
```

---

## 🔐 API Endpoints

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| POST | `/api/auth/login` | — | Login, returns JWT + sets httpOnly cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, return new access token |
| POST | `/api/auth/logout` | Cookie | Delete refresh token, clear cookie |
| GET | `/api/auth/me` | Bearer | Current user profile |
| PUT | `/api/auth/profile` | Bearer | Update name/email |
| POST | `/api/auth/change-password` | Bearer | Change password, invalidate all sessions |
| GET | `/api/dashboard/summary` | Bearer | Today's KPIs + 7-day sparklines (cached 60s) |
| GET | `/api/patients/visits` | Bearer | Paginated visits with filters |
| GET | `/api/patients/visits/export` | ADMIN | CSV export of visits |
| GET | `/api/patients/:id` | Bearer | Full patient profile with visit history |
| GET | `/api/doctors` | Bearer | All doctors with stats |
| GET | `/api/doctors/workload` | Bearer | Workload % sorted by busiest |
| GET | `/api/departments/performance` | Bearer | Department metrics with revenue share |
| GET | `/api/revenue` | Bearer | Grouped revenue (day/month/year) |
| GET | `/api/revenue/breakdown` | Bearer | Revenue by dept + payment type |
| GET | `/api/appointments` | Bearer | Paginated appointments with filters |
| GET | `/api/appointments/calendar` | Bearer | Date→count map for a month |
| POST | `/api/appointments` | ADMIN/DOCTOR | Create appointment (clash check) |
| PATCH | `/api/appointments/:id/status` | Bearer | Update status, auto-creates Visit+Revenue |
| GET | `/api/health` | — | Health check with DB connectivity |

