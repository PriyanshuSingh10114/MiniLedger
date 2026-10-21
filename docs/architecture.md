# MiniLedger Architecture Documentation

## 1. Overview & System Purpose

MiniLedger is a personal money-lending tracker application engineered to answer critical financial questions for individual users:

- How much money have I lent in total?
- How much money has been repaid?
- How much money is still outstanding?
- How much outstanding money is overdue?
- Which friends owe me money?
- Which loans are approaching their due dates?
- When was each loan created and repaid?

MiniLedger ensures **mathematical financial correctness**, **strict multi-tenant data isolation**, and **high operational security**.

---

## 2. High-Level System Architecture

```text
┌────────────────────────────────────────────────────────┐
│            Mobile Client (React Native + Expo)         │
│  - Expo Router (Tabs & Dynamic Route Navigation)       │
│  - TanStack Query (Server-State Caching & Invalidation) │
│  - SecureStore (Encrypted Refresh Token Storage)       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON REST
                           ▼
┌────────────────────────────────────────────────────────┐
│              Backend REST API (Node.js + Express)      │
│  - Helmet & CORS (Security Headers & Origin Isolation) │
│  - Rate Limiters (Per-IP & Per-Phone Protections)      │
│  - Zod Middleware (Server-Side Schema Validation)      │
│  - JWT Auth (15-min Access Tokens + Rotation)          │
│  - Transactional Services (PostgreSQL Row-Level Locks) │
└──────────────────────────┬─────────────────────────────┘
                           │ Prisma ORM / SQL
                           ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL Relational Database           │
│  - Strict FK Constraints (No silent cascade deletions) │
│  - Integer Paise Columns (BigInt - No floating point)  │
│  - Atomic Transactions & FOR UPDATE Row Locks          │
└────────────────────────────────────────────────────────┘
```

---

## 3. Monorepo Organization

MiniLedger uses an npm workspaces monorepo:

- **`packages/shared`**: Reusable TypeScript types, Zod schemas, constants, date helpers, and money conversion utilities (`rupeesToPaise`, `paiseToRupees`, `formatPaiseToINR`).
- **`services/api`**: RESTful Express service backed by PostgreSQL and Prisma ORM.
- **`apps/mobile`**: Cross-platform React Native mobile client built with Expo SDK 52 and Expo Router.
- **`docs/`**: Comprehensive technical documentation for architecture, database, security, API, and deployment.

---

## 4. Key Architectural Decisions

### 4.1 Financial Precision Engine (Integer Paise)

Floating-point arithmetic in JavaScript (`0.1 + 0.2 !== 0.3`) causes precision drift that is unacceptable in financial applications. MiniLedger mandates that:

- Every database amount is stored as **integer paise** (₹1.00 = 100 paise) using PostgreSQL `BigInt`.
- Conversions use decimal-safe string parsing (`BigInt(whole) * 100n + BigInt(fraction)`), rejecting inputs with more than two decimal places.
- The UI formats display values via standard Indian currency localization (`Intl.NumberFormat('en-IN')`).

### 4.2 Dynamic Overdue Calculation

Overdue status is **never permanently stored** in the database because a loan that is active today might become overdue tomorrow without a database update.

- A loan is calculated as overdue if and only if:
  1. `status === 'OUTSTANDING'`
  2. `remainingBalance > 0`
  3. `dueDate < today` in the `Asia/Kolkata` business timezone.
- Repaid loans are excluded from overdue calculations.

### 4.3 Atomic Repayment Operations

Repayments occur in an atomic PostgreSQL transaction with row-level locking (`FOR UPDATE`):

1. Verifies loan ownership.
2. Checks that the loan has an outstanding balance.
3. Inserts the repayment record.
4. Updates the loan status to `REPAID`.
5. Commits atomically. If two requests attempt to settle the same loan concurrently, row locking ensures one succeeds and the other receives an `ALREADY_REPAID` error.
