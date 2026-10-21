# MiniLedger — Personal Money-Lending Tracker

[![CI Pipeline](https://github.com/PriyanshuSingh10114/MiniLedger/actions/workflows/ci.yml/badge.svg)](https://github.com/PriyanshuSingh10114/MiniLedger/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MiniLedger is a **production-ready full-stack mobile application** engineered to help individuals track money lent to friends, monitor repayment status, highlight overdue balances, and maintain an immutable transaction history with **mathematical financial correctness**.

Built for a Full Stack Development assessment, adhering to strict enterprise engineering standards: **multi-tenant data isolation**, **integer paise financial calculations**, **cryptographically secure mock OTP authentication with rotation**, **atomic transactional settlements**, and **100% automated test coverage**.

---

## Table of Contents

- [1. Core Features](#1-core-features)
- [2. Technology Stack](#2-technology-stack)
- [3. Architecture & Project Layout](#3-architecture--project-layout)
- [4. Financial Precision Engine](#4-financial-precision-engine)
- [5. Getting Started (Local Setup)](#5-getting-started-local-setup)
- [6. Development OTP Flow](#6-development-otp-flow)
- [7. Automated Testing](#7-automated-testing)
- [8. API Reference & Swagger UI](#8-api-reference--swagger-ui)
- [9. Docker & Containerization](#9-docker--containerization)
- [10. CI/CD Pipeline](#10-cicd-pipeline)
- [11. Troubleshooting](#11-troubleshooting)

---

## 1. Core Features

- **Personal Financial Dashboard**: Real-time summary computing **Total Lent**, **Total Repaid**, **Active Outstanding Balance**, and **Overdue Amounts**.
- **Accurate Overdue Tracking**: Dynamically computes overdue status from due date and outstanding balance against business timezone (`Asia/Kolkata`).
- **Loan Management**: Create loans with friend names, amounts, repayment dates, and notes. Filter by Active, Overdue, or Repaid, with instant search and multi-criteria sorting.
- **Atomic Full Repayments**: Settle loans in atomic database transactions protected by PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) and idempotency keys to prevent race conditions or duplicate repayments.
- **Secure Mock OTP Authentication**: 6-digit cryptographically generated OTP printed to server logs in development mode, backed by salted bcrypt hashes, resend cooldowns, and attempt limits.
- **Session Management**: 15-minute JWT access tokens paired with rotating 256-bit refresh tokens stored securely on devices via `Expo SecureStore`.
- **Receipt Attachments**: Authenticated file attachments supporting image and PDF documents with private storage.

---

## 2. Technology Stack

### Mobile Application

- **Framework**: React Native with **Expo SDK 52**
- **Language**: TypeScript (strict mode)
- **Routing**: **Expo Router v4** (file-based navigation with tabs and modals)
- **Server State**: **TanStack Query v5** (caching, background refetching, mutation invalidation)
- **Security Storage**: **Expo SecureStore** (hardware-backed Android Keystore & iOS Keychain)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Design System**: Tailored tokens for spacing, typography, and accessible status colors

### Backend REST API

- **Runtime**: **Node.js 22 LTS**
- **Framework**: **Express** with TypeScript (ESM)
- **Database & ORM**: **PostgreSQL 16** with **Prisma ORM** and committed migrations
- **Validation**: **Zod** schema validation for all requests and environment variables
- **Security**: **Helmet**, CORS, **express-rate-limit**, **bcryptjs** (OTP hashing), SHA-256 token hashing
- **Logging**: **Pino** structured logging with automatic credential redaction
- **Documentation**: **OpenAPI 3.0** with **Swagger UI** (`/api-docs`)

### Tooling & Infrastructure

- **Monorepo**: npm workspaces
- **Containers**: Docker & Docker Compose
- **Testing**: **Vitest** + **Supertest**
- **CI/CD**: GitHub Actions

---

## 3. Architecture & Project Layout

```text
miniledger/
├── apps/
│   └── mobile/              # React Native / Expo application
│       ├── app/             # Expo Router screen routes
│       │   ├── (auth)/      # Phone and OTP verification screens
│       │   ├── (tabs)/      # Dashboard and loan list screens
│       │   ├── loans/       # New loan form and detail screens
│       │   └── settings.tsx # Profile and security settings
│       ├── src/             # Reusable components, hooks, theme tokens, and storage
│       └── app.json         # Expo configuration
├── services/
│   └── api/                 # Express REST backend
│       ├── prisma/          # Prisma schema, migrations, and seed script
│       ├── src/             # Config, lib, middleware, modules, and routes
│       └── tests/           # Unit and Supertest integration test suites
├── packages/
│   └── shared/              # Shared types, Zod schemas, constants, and money utils
├── docs/                    # Architecture, database, security, and deployment docs
├── docker-compose.yml       # Containerized setup
├── package.json             # Root monorepo workspace configuration
└── .env.example             # Documented environment template
```

---

## 4. Financial Precision Engine

Never use floating-point numbers for money calculations:

- All monetary amounts in the database and API are represented as **integer paise** (`1 Rupee = 100 paise`).
- Decimal-safe string splitting handles parsing (`"1250.50"` -> `125050 paise`), preventing floating-point errors (`0.1 + 0.2 === 0.30000000000000004`).
- Amounts are strictly positive with at most two decimal places.

---

## 5. Getting Started (Local Setup)

### Prerequisites

- Node.js 20+ or 22 LTS
- npm 10+
- PostgreSQL (via local service or Docker)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/PriyanshuSingh10114/MiniLedger.git
cd MiniLedger
npm install
```

### 2. Configure Environment

Create `.env` inside `services/api/` (or copy from `.env.example`):

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/miniledger?schema=public
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/miniledger_test?schema=public
JWT_ACCESS_SECRET=miniledger_dev_access_secret_super_secure_key_at_least_32_chars
JWT_REFRESH_SECRET=miniledger_dev_refresh_secret_super_secure_key_at_least_32_chars
ENABLE_DEV_OTP=true
```

### 3. Apply Migrations & Seed Sample Data

```bash
# Run migrations
npm run db:migrate

# Seed demo loans and user
npm run db:seed
```

### 4. Start the Backend API

```bash
npm run dev:api
```

The API starts at `http://localhost:4000`.
Swagger UI is available at `http://localhost:4000/api-docs`.

### 5. Start the Mobile Client

In a separate terminal:

```bash
npm run dev:mobile
```

Press `a` to open in Android Emulator, `w` for Web, or scan the QR code with the Expo Go app on a physical device.

---

## 6. Development OTP Flow

MiniLedger uses phone verification. In development mode:

1. Open the mobile app and enter any valid phone number (e.g. `+919876543210` or `9876543210`).
2. Tap **Get Verification Code**.
3. Inspect your running API terminal. You will see a log entry:
   ```text
   [INFO] [DEV ONLY] OTP for +919876543210 is: 481920 (expires in 5 mins)
   ```
4. Enter `481920` in the app to authenticate.
5. In production mode, `ENABLE_DEV_OTP` fails closed to prevent mock OTP generation.

---

## 7. Automated Testing

MiniLedger comes with comprehensive unit and integration tests covering financial rules, OTP lifecycle, concurrency, duplicate repayments, and user isolation.

```bash
# Run all backend tests (Unit & Integration)
npm run --workspace=@miniledger/api test

# Run mobile validation tests
npm run --workspace=@miniledger/mobile test

# Run TypeScript checks across all workspaces
npm run typecheck
```

### Test Results Summary:

- **`tests/unit/money.test.ts`**: 5 tests passed (decimal-safe parsing, limits, formatting)
- **`tests/unit/date.test.ts`**: 4 tests passed (business timezone, overdue logic)
- **`tests/unit/otp.test.ts`**: 3 tests passed (crypto entropy, bcrypt verification, token hashing)
- **`tests/integration/api.test.ts`**: 20 tests passed (health, auth, loans, atomic repayment, isolation)
- **`apps/mobile/tests/`**: 10 tests passed (form schemas, mobile currency helpers)
- **Total**: **42 / 42 Automated Tests Passing (100%)**

---

## 8. API Reference & Swagger UI

Interactive Swagger documentation is available at `http://localhost:4000/api-docs`.

| Method | Endpoint                       | Description                  | Auth Required     |
| ------ | ------------------------------ | ---------------------------- | ----------------- |
| `GET`  | `/api/v1/health`               | Health & DB connection check | No                |
| `POST` | `/api/v1/auth/request-otp`     | Request 6-digit OTP          | No (Rate-limited) |
| `POST` | `/api/v1/auth/verify-otp`      | Verify OTP & receive tokens  | No (Rate-limited) |
| `POST` | `/api/v1/auth/refresh`         | Rotate refresh token         | No                |
| `POST` | `/api/v1/auth/logout`          | Revoke session               | No                |
| `GET`  | `/api/v1/users/me`             | Current user profile         | Bearer JWT        |
| `GET`  | `/api/v1/loans`                | Filtered & paginated loans   | Bearer JWT        |
| `POST` | `/api/v1/loans`                | Create new loan              | Bearer JWT        |
| `GET`  | `/api/v1/loans/:id`            | Loan details & history       | Bearer JWT        |
| `POST` | `/api/v1/loans/:id/repayments` | Full loan repayment          | Bearer JWT        |
| `GET`  | `/api/v1/dashboard/summary`    | Real-time financial metrics  | Bearer JWT        |
| `POST` | `/api/v1/loans/:id/receipt`    | Upload loan receipt          | Bearer JWT        |

---

## 9. Docker & Containerization

To run the complete backend and PostgreSQL in Docker:

```bash
docker compose up --build -d
```

The Docker setup includes:

- PostgreSQL 16 with persistent volume and automatic healthchecks.
- Multi-stage Node.js 22 production image running as non-root user `node`.

---

## 10. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every commit and pull request:

1. Installs clean dependencies via `npm ci`.
2. Validates code formatting with Prettier.
3. Checks TypeScript types across all workspaces.
4. Starts a test PostgreSQL container.
5. Deploys Prisma migrations to the test database.
6. Runs all unit and Supertest integration tests.
7. Validates production builds.

---

## 11. Troubleshooting

- **Android Emulator Networking**: The Android Emulator cannot reach `localhost` directly. The mobile app automatically points to `http://10.0.2.2:4000/api/v1` on Android.
- **Physical Device**: Update `EXPO_PUBLIC_API_URL` to your computer's local Wi-Fi IP (e.g. `http://192.168.1.50:4000/api/v1`).
- **Database Connection**: Ensure PostgreSQL is listening on the port configured in `.env`.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
