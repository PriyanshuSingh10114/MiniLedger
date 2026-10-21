# MiniLedger Security & Privacy Architecture

## 1. Threat Modeling & Principles

MiniLedger treats all incoming HTTP requests, headers, and query parameters as untrusted.

### Core Security Rules:

1. **Never Trust Client Ownership**: The backend never accepts `userId` from the request body or query string. Ownership is derived exclusively from the verified JWT access token.
2. **Fail Closed in Production**: In production mode (`NODE_ENV=production`), the application refuses to start if `ENABLE_DEV_OTP=true`.
3. **Never Log Sensitive Credentials**: Passwords, OTP codes, refresh tokens, and JWT tokens are redacted from structured Pino logs.
4. **Idempotent Financial Mutations**: Financial repayment requests cannot be executed twice.

---

## 2. Authentication Architecture

### 2.1 OTP Generation & Verification

- **Cryptographic Randomness**: 6-digit OTPs are generated using `node:crypto.randomInt(100000, 1000000)`.
- **Bcrypt Hashing**: Plaintext OTPs are never persisted. Only salted bcrypt hashes are saved in the `otp_challenges` table.
- **Expiry & Attempt Caps**:
  - Expiry: 5 minutes (300 seconds).
  - Attempt limit: Max 5 failed attempts before challenge is permanently invalidated.
  - Resend cooldown: 60 seconds enforced at the database level.
  - Single-Use Consumption: Once verified, `consumedAt` timestamp is set atomically, preventing replay.

### 2.2 JWT & Refresh Token Rotation

- **Access Tokens**: Short-lived (15 minutes), signed with HMAC-SHA256 and verified using secret key and strict issuer tags.
- **Refresh Tokens**: 256-bit cryptographically random tokens (`crypto.randomBytes(32)`).
- **Hashed Sessions**: The raw refresh token is hashed with SHA-256 before storage in `refresh_sessions`.
- **Token Rotation**: Every refresh request revokes the existing refresh token and issues a new pair. If a previously revoked token is submitted, the system detects a potential replay attack and revokes all active sessions for that user.

---

## 3. Rate Limiting & Protection

- **Request OTP**: Maximum 10 requests per 10-minute window per IP.
- **Verify OTP**: Maximum 15 requests per 10-minute window per IP.
- **General API**: Standard rate limiting configured via `express-rate-limit`.

---

## 4. Mobile Storage Security

Tokens on iOS and Android devices are saved via **Expo SecureStore**, which uses iOS Keychain Services and Android Keystore (backed by encrypted SharedPreferences). Tokens are never saved in unencrypted AsyncStorage.
