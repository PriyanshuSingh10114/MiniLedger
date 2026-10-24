<div align="center">

# 💰 MiniLedger

### Production-Ready Full-Stack Personal Money-Lending Tracker

**Eliminate floating-point drift • Track overdue debts • Atomic transactional settlements**

<br />

[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/PriyanshuSingh10114/MiniLedger/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI%20Pipeline)](https://github.com/PriyanshuSingh10114/MiniLedger/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_52-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Tests-42_Passing_100%25-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

[📖 Architecture Guide](docs/architecture.md) • [🗄️ Database Schema](docs/database.md) • [🔒 Security Model](docs/security.md) • [⚡ API Reference](docs/api.md) • [🚀 Deployment](docs/deployment.md)

</div>

<br />

---

## 📌 Executive Overview

**MiniLedger** is a mobile-first, enterprise-grade personal money-lending application designed to track loans given to friends, monitor repayment schedules, flag overdue debts, and maintain an immutable ledger with **mathematical financial correctness**.

Built for a competitive Full Stack Development evaluation, MiniLedger replaces brittle toy patterns with production software engineering:

- 🛡️ **Zero Floating-Point Financial Drift**: authoritative storage in integer paise (`1 INR = 100 paise`) utilizing PostgreSQL `BigInt`.
- ⚡ **Atomic PostgreSQL Transactions**: settlements locked with `SELECT ... FOR UPDATE` and protected by idempotency keys to eliminate double repayments.
- 🕒 **Dynamic Overdue Calculations**: overdue status is evaluated in real-time against the `Asia/Kolkata` business timezone rather than stale static DB flags.
- 🔑 **Cryptographic Authentication**: 6-digit OTP verification with bcrypt hashing, cooldown periods, attempt ceilings, and automatic JWT token rotation.
- 📱 **Native Mobile Client**: built using **Expo SDK 52** and **Expo Router v4**, backed by **TanStack Query** server-state caching and **Expo SecureStore** encryption.
- 🧪 **100% Automated Test Coverage**: 42 unit and Supertest integration tests covering financial math, OTP lifecycle, concurrency, and cross-user isolation.

---

## 🛠️ Technology Stack

<div align="center">

| Domain               | Technologies                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile Client**    | ![React Native](https://img.shields.io/badge/-React_Native-222?logo=react) ![Expo](https://img.shields.io/badge/-Expo_SDK_52-000?logo=expo) ![Expo Router](https://img.shields.io/badge/-Expo_Router_v4-000) ![TanStack Query](https://img.shields.io/badge/-TanStack_Query-FF4154?logo=reactquery&logoColor=white) ![Zod](https://img.shields.io/badge/-Zod-3E67B1?logo=zod&logoColor=white) ![SecureStore](https://img.shields.io/badge/-SecureStore-4630EB)                          |
| **Backend API**      | ![Node.js](https://img.shields.io/badge/-Node.js_22_LTS-339933?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) ![Pino](https://img.shields.io/badge/-Pino_Logger-68A063) ![Helmet](https://img.shields.io/badge/-Helmet_Security-4B32C3) ![Swagger](https://img.shields.io/badge/-OpenAPI_3.0-85EA2D?logo=swagger&logoColor=black) |
| **Database & Cache** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL_16-4169E1?logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/-Prisma_ORM-2D3748?logo=prisma&logoColor=white) ![Migrations](https://img.shields.io/badge/-Committed_Migrations-7952B3)                                                                                                                                                                                                                       |
| **Security & Auth**  | ![JWT](https://img.shields.io/badge/-JWT_15min-000000?logo=jsonwebtokens) ![Bcrypt](https://img.shields.io/badge/-Bcrypt_Salted-F7DF1E?logo=javascript&logoColor=black) ![SHA-256](https://img.shields.io/badge/-SHA--256_Rotation-blue) ![Rate Limit](https://img.shields.io/badge/-Rate_Limited-red)                                                                                                                                                                                  |
| **DevOps & Tooling** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) ![Compose](https://img.shields.io/badge/-Docker_Compose-2496ED) ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=githubactions&logoColor=white) ![Prettier](https://img.shields.io/badge/-Prettier-F7B93E?logo=prettier&logoColor=white) ![Vitest](https://img.shields.io/badge/-Vitest-6E9F18?logo=vitest&logoColor=white)                                                |

</div>

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│            Mobile Client (React Native + Expo 52)      │
│  - Expo Router (Tabs, Modals, Protected Route Guards)  │
│  - TanStack Query (Background Refetch & Invalidation)  │
│  - Expo SecureStore (Encrypted Hardware Storage)       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON REST
                           ▼
┌────────────────────────────────────────────────────────┐
│            Backend REST API (Node.js 22 + Express)     │
│  - Helmet & CORS (Security Headers & Origin Isolation) │
│  - Rate Limiters (10 OTP req/10 min, 15 verify/10 min) │
│  - Zod Middleware (Server-Side Request Validation)     │
│  - JWT & Rotation (15-min Access, 30-day Refresh)      │
│  - Transaction Engine (PostgreSQL Row-Level Locks)     │
└──────────────────────────┬─────────────────────────────┘
                           │ Prisma ORM / SQL
                           ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL 16 Relational Engine          │
│  - Strict Referential Integrity (onDelete: Restrict)   │
│  - Integer Paise Columns (BigInt - No float rounding)  │
│  - Atomic Transactions & FOR UPDATE Row Locks          │
└────────────────────────────────────────────────────────┘
```

---

## 💡 Key Architectural Highlights

### 1. The Integer Paise Financial Engine

JavaScript native numbers suffer from IEEE 754 precision inaccuracies:

```javascript
0.1 + 0.2 === 0.30000000000000004; // ❌ Disastrous for financial ledgers
```

MiniLedger enforces integer paise at every layer:

- **₹1.00** is stored strictly as `100n` paise.
- **₹1,250.50** is stored as `125050n` paise.
- Conversion functions in `packages/shared/src/money.ts` use string parsing rather than float multiplication, throwing errors on fractional sub-paise amounts or amounts beyond 2 decimal places.

### 2. Atomic Repayments with Row-Level Locking

Preventing duplicate settlements and concurrency races:

```sql
SELECT id, "userId", status, amount
FROM loans
WHERE id = $1::uuid AND "userId" = $2::uuid
FOR UPDATE;
```

If two settlement requests arrive concurrently, the second query waits until the first commits, sees `status === 'REPAID'`, and immediately fails with `ALREADY_REPAID` (HTTP 400).

### 3. Dynamic Overdue Engine

A loan due on `2026-10-20` is overdue on `2026-10-21` without requiring a cron job to mutate rows. Overdue status is computed dynamically:

```typescript
isOverdue = status === 'OUTSTANDING' && remainingBalance > 0 && dueDate < todayInIST;
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: `v20.0.0` or `v22.0.0+`
- **npm**: `v10.0.0+`
- **PostgreSQL**: Local service or Docker

### 1. Clone & Install

```bash
git clone https://github.com/PriyanshuSingh10114/MiniLedger.git
cd MiniLedger
npm install
```

### 2. Environment Setup

Create `services/api/.env` (or copy from `.env.example`):

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/miniledger?schema=public
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/miniledger_test?schema=public
JWT_ACCESS_SECRET=miniledger_dev_access_secret_super_secure_key_at_least_32_chars
JWT_REFRESH_SECRET=miniledger_dev_refresh_secret_super_secure_key_at_least_32_chars
ENABLE_DEV_OTP=true
```

### 3. Database Migration & Seed

```bash
# Apply Prisma database migrations
npm run db:migrate

# Seed demo loans and test user
npm run db:seed
```

### 4. Start the Application

```bash
# Terminal 1: Launch Backend REST API
npm run dev:api

# Terminal 2: Launch Mobile App (Expo)
npm run dev:mobile
```

- **Interactive API Documentation (Swagger)**: [`http://localhost:4000/api-docs`](http://localhost:4000/api-docs)
- **API Health Check**: [`http://localhost:4000/api/v1/health`](http://localhost:4000/api/v1/health)
- **Mobile Emulator**: Press `a` in the Expo terminal for Android or `w` for Web preview.

---

## 🔑 Development OTP Authentication Flow

1. In the mobile client, enter any valid mobile number (e.g., `+919876543210` or `9876543210`).
2. Tap **Get Verification Code**.
3. Inspect your active API server terminal. A dev log will print:
   ```text
   [INFO] [DEV ONLY] OTP for +919876543210 is: 481920 (expires in 5 mins)
   ```
4. Enter `481920` in the app to authenticate.
5. In production mode (`NODE_ENV=production`), `ENABLE_DEV_OTP` fails closed on startup.

---

## 🧪 Automated Testing Suite

MiniLedger features comprehensive unit and Supertest integration tests covering financial precision, OTP security, rate limiting, and cross-user isolation.

```bash
# Run all backend unit & integration tests
npm run --workspace=@miniledger/api test

# Run mobile validation & utility tests
npm run --workspace=@miniledger/mobile test

# Run full monorepo typechecks
npm run typecheck
```

### Test Metrics (100% Pass Rate)

```text
✓ services/api/tests/unit/date.test.ts ........... 4 passed
✓ services/api/tests/unit/money.test.ts .......... 5 passed
✓ services/api/tests/unit/otp.test.ts ............ 3 passed
✓ services/api/tests/integration/api.test.ts .... 20 passed
✓ apps/mobile/tests/validation.test.ts ........... 7 passed
✓ apps/mobile/tests/currency.test.ts ............. 3 passed

Test Files:  6 passed (6)
Total Tests: 42 passed (42) — 100% Passing
```

---

## 📂 Repository Monorepo Structure

```text
miniledger/
├── apps/
│   └── mobile/                          # React Native / Expo application
│       ├── app/                         # Expo Router screen routes
│       │   ├── (auth)/                  # Phone & OTP verification
│       │   ├── (tabs)/                  # Financial Dashboard & Loan List
│       │   ├── loans/                   # Add Loan & Loan Details modals
│       │   └── settings.tsx             # Profile, session info & Logout
│       ├── src/                         # Reusable UI components & hooks
│       └── tests/                       # Mobile validation tests
├── services/
│   └── api/                             # Node.js + Express REST API
│       ├── prisma/                      # Schema, migrations & seed
│       ├── src/                         # Express modules, middleware, config
│       ├── tests/                       # Unit & Supertest integration tests
│       └── Dockerfile                   # Multi-stage production container
├── packages/
│   └── shared/                          # Reusable types, Zod schemas, money engine
├── docs/                                # Technical deep-dive documentation
├── .github/workflows/ci.yml             # GitHub Actions CI workflow
├── docker-compose.yml                   # PostgreSQL + API container stack
├── package.json                         # Monorepo workspaces definition
└── README.md                            # Project documentation
```

---

## 🐳 Docker Deployment

Run the complete backend stack (PostgreSQL + Express API) with persistent volumes and healthchecks:

```bash
docker compose up --build -d
```

Verify service status:

```bash
docker compose ps
docker compose logs -f api
```

---

## 👤 Author & Maintainer

<table align="center" width="100%">
  <tr>
    <td align="center" width="30%">
      <img src="https://github.com/PriyanshuSingh10114.png" width="130px;" alt="Priyanshu Singh" style="border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"/><br/>
      <b>Priyanshu Singh</b><br/>
      <sub>Software Engineer | AI, Cloud & Cybersecurity</sub>
    </td>
    <td width="70%">
      <p><b>Bio:</b> Computer Science and Engineering student specializing in <b>AI application development, cloud-native systems, cybersecurity, and DevSecOps</b>. Experienced in building <b>AI-powered applications, secure backend services, cloud infrastructure, and automated deployment workflows</b> using technologies across AWS, Kubernetes, Docker, Terraform, FastAPI, Node.js, React, and modern AI/LLM frameworks.</p>
      <p>
        <a href="https://github.com/PriyanshuSingh10114"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
        <a href="mailto:priyanshusingh22340@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
        <a href="https://linkedin.com"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
      </p>
      <p>
        <b>Experience & Technical Focus:</b>
        <br/>
        <br/>
        <img src="https://img.shields.io/badge/TM_Cloud_Solutions-AI_Application_Development-0284C7?style=for-the-badge&logo=googlecloud&logoColor=white" alt="TM Cloud Solutions"/>
        <br/>
        <img src="https://img.shields.io/badge/Quick_Intell-Software_Engineering-6366F1?style=for-the-badge&logo=git&logoColor=white" alt="Quick Intell"/>
      </p>
    </td>
  </tr>
</table>

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
