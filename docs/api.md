# MiniLedger REST API Reference

The MiniLedger API exposes interactive OpenAPI / Swagger documentation at `/api-docs` when running the server.

Base URL: `http://localhost:4000/api/v1`

---

## Endpoints

### 1. Health & Readiness

`GET /health`

- **Response (200 OK)**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-10-22T01:00:00.000Z",
    "database": "connected",
    "version": "1.0.0"
  }
  ```

---

### 2. Authentication

#### `POST /auth/request-otp`

Request OTP for mobile number.

- **Request Body**:
  ```json
  {
    "phoneNumber": "+919876543210"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "OTP has been sent to your phone number",
      "cooldownSeconds": 60
    }
  }
  ```

#### `POST /auth/verify-otp`

Verify 6-digit OTP code and retrieve access and refresh tokens.

- **Request Body**:
  ```json
  {
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "b35f2a0e-585c-428c-bc9e-b5e7be8911f5",
        "phoneNumber": "+919876543210",
        "createdAt": "2026-10-22T00:00:00.000Z",
        "updatedAt": "2026-10-22T00:00:00.000Z"
      },
      "tokens": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "7c9e...",
        "expiresIn": 900
      }
    }
  }
  ```

#### `POST /auth/refresh`

Rotate refresh token and get new access token.

- **Request Body**:
  ```json
  { "refreshToken": "7c9e..." }
  ```

#### `POST /auth/logout`

Revoke refresh session.

---

### 3. Users

#### `GET /users/me`

Retrieve authenticated user profile.

- **Headers**: `Authorization: Bearer <token>`

---

### 4. Loans

#### `GET /loans`

List loans for the current user.

- **Query Parameters**:
  - `status`: `OUTSTANDING` | `REPAID` | `ALL`
  - `isOverdue`: `true` | `false`
  - `search`: Friend name query string
  - `sortBy`: `dueDate` | `createdAt` | `amount`
  - `sortOrder`: `asc` | `desc`
  - `page`: default 1
  - `limit`: default 10

#### `POST /loans`

Create a new loan.

- **Request Body**:
  ```json
  {
    "friendName": "Rahul Sharma",
    "amount": 2500,
    "dueDate": "2026-11-20",
    "note": "Weekend trip split"
  }
  ```

#### `GET /loans/:id`

Retrieve loan details by ID with repayment history.

#### `POST /loans/:id/repayments`

Record full repayment for loan.

- **Request Body**:
  ```json
  {
    "idempotencyKey": "Optional UUID"
  }
  ```

---

### 5. Dashboard

#### `GET /dashboard/summary`

Calculates real-time financial aggregates:

- `totalLentPaise`
- `totalRepaidPaise`
- `totalOutstandingPaise`
- `totalOverduePaise`
- `activeLoansCount`
- `overdueLoansCount`
- `repaidLoansCount`
- `totalLoansCount`
- `recentLoans`
