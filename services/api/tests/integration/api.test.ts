import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('MiniLedger API End-to-End Integration Tests', () => {
  const testPhoneUser1 = '+919999911111';
  const testPhoneUser2 = '+919999922222';

  let user1Token: string;
  let user1RefreshToken: string;
  let user1Id: string;

  let user2Token: string;
  let user2Id: string;

  beforeAll(async () => {
    // Clean test database for test phones
    const users = await prisma.user.findMany({
      where: { phoneNumber: { in: [testPhoneUser1, testPhoneUser2] } },
    });
    const userIds = users.map((u) => u.id);

    await prisma.repayment.deleteMany({ where: { loan: { userId: { in: userIds } } } });
    await prisma.receipt.deleteMany({ where: { loan: { userId: { in: userIds } } } });
    await prisma.loan.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.refreshSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.otpChallenge.deleteMany({
      where: { phoneNumber: { in: [testPhoneUser1, testPhoneUser2] } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health Check', () => {
    it('GET /api/v1/health returns status UP with database connected', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. Authentication Flow', () => {
    it('POST /api/v1/auth/request-otp creates a challenge', async () => {
      const res = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ phoneNumber: testPhoneUser1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const challenge = await prisma.otpChallenge.findFirst({
        where: { phoneNumber: testPhoneUser1, consumedAt: null },
      });
      expect(challenge).not.toBeNull();
    });

    it('POST /api/v1/auth/verify-otp rejects incorrect OTP', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phoneNumber: testPhoneUser1, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_OTP');
    });

    it('POST /api/v1/auth/verify-otp succeeds with valid OTP and creates session', async () => {
      // In dev mode, we can look up the challenge or reset it
      // Let's create a known challenge with bcrypt hash of '123456'
      const { hashOtp } = await import('../../src/lib/hash.js');
      const hashed = await hashOtp('654321');

      await prisma.otpChallenge.create({
        data: {
          phoneNumber: testPhoneUser1,
          hashedOtp: hashed,
          expiresAt: new Date(Date.now() + 300000),
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phoneNumber: testPhoneUser1, otp: '654321' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();

      user1Token = res.body.data.tokens.accessToken;
      user1RefreshToken = res.body.data.tokens.refreshToken;
      user1Id = res.body.data.user.id;
    });

    it('prevents OTP reuse once consumed', async () => {
      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phoneNumber: testPhoneUser1, otp: '654321' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/users/me returns authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.phoneNumber).toBe(testPhoneUser1);
      expect(res.body.data.id).toBe(user1Id);
    });

    it('authenticates User 2 for isolation testing', async () => {
      const { hashOtp } = await import('../../src/lib/hash.js');
      const hashed = await hashOtp('999999');

      await prisma.otpChallenge.create({
        data: {
          phoneNumber: testPhoneUser2,
          hashedOtp: hashed,
          expiresAt: new Date(Date.now() + 300000),
        },
      });

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phoneNumber: testPhoneUser2, otp: '999999' });

      expect(res.status).toBe(200);
      user2Token = res.body.data.tokens.accessToken;
      user2Id = res.body.data.user.id;
    });
  });

  describe('3. Loan Creation & Overdue Calculations', () => {
    let overdueLoanId: string;
    let upcomingLoanId: string;

    it('POST /api/v1/loans creates an overdue loan (past due date)', async () => {
      const pastDate = '2026-01-15';
      const res = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          friendName: 'Rohan Sharma',
          amount: 2500, // ₹2,500
          dueDate: pastDate,
          note: 'Emergency cash',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(250000); // 250,000 paise
      expect(res.body.data.amountInRupees).toBe(2500);
      expect(res.body.data.isOverdue).toBe(true);
      expect(res.body.data.status).toBe('OUTSTANDING');

      overdueLoanId = res.body.data.id;
    });

    it('POST /api/v1/loans creates an active non-overdue loan (future due date)', async () => {
      const futureDate = '2026-12-31';
      const res = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          friendName: 'Sneha Patel',
          amount: '1000.50', // ₹1,000.50
          dueDate: futureDate,
          note: 'Movie tickets share',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(100050); // 100,050 paise
      expect(res.body.data.isOverdue).toBe(false);
      expect(res.body.data.status).toBe('OUTSTANDING');

      upcomingLoanId = res.body.data.id;
    });

    it('GET /api/v1/loans lists loans with search, status and pagination', async () => {
      const res = await request(app)
        .get('/api/v1/loans?search=Rohan&status=OUTSTANDING')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].friendName).toBe('Rohan Sharma');
      expect(res.body.meta.pagination.total).toBe(1);
    });

    it('GET /api/v1/loans/:id retrieves loan details with repayments', async () => {
      const res = await request(app)
        .get(`/api/v1/loans/${overdueLoanId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(overdueLoanId);
      expect(res.body.data.outstandingAmount).toBe(250000);
    });

    it('POST /api/v1/loans/:id/repayments records full repayment atomically', async () => {
      const res = await request(app)
        .post(`/api/v1/loans/${overdueLoanId}/repayments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.loan.status).toBe('REPAID');
      expect(res.body.data.loan.outstandingAmount).toBe(0);
      expect(res.body.data.loan.isOverdue).toBe(false);
      expect(res.body.data.repayment.amount).toBe(250000);
    });

    it('rejects duplicate repayments on already repaid loan', async () => {
      const res = await request(app)
        .post(`/api/v1/loans/${overdueLoanId}/repayments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ALREADY_REPAID');
    });

    it('GET /api/v1/dashboard/summary calculates correct totals', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      const summary = res.body.data;

      // Total lent = 250,000 + 100,050 = 350,050 paise
      expect(summary.totalLentPaise).toBe(350050);
      // Total repaid = 250,000 paise (Rohan's loan repaid)
      expect(summary.totalRepaidPaise).toBe(250000);
      // Total outstanding = 100,050 paise (Sneha's loan)
      expect(summary.totalOutstandingPaise).toBe(100050);
      // Overdue = 0 (Rohan's loan is repaid, Sneha's loan is in the future)
      expect(summary.totalOverduePaise).toBe(0);
      expect(summary.repaidLoansCount).toBe(1);
      expect(summary.activeLoansCount).toBe(1);
    });
  });

  describe('4. Tenant Isolation & Security Enforcements', () => {
    it('User 2 CANNOT access User 1 loan (returns 404 NOT_FOUND)', async () => {
      // Find a loan belonging to User 1
      const user1Loan = await prisma.loan.findFirst({ where: { userId: user1Id } });
      expect(user1Loan).not.toBeNull();

      const res = await request(app)
        .get(`/api/v1/loans/${user1Loan!.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User 2 CANNOT repay User 1 loan', async () => {
      const user1Loan = await prisma.loan.findFirst({ where: { userId: user1Id } });

      const res = await request(app)
        .post(`/api/v1/loans/${user1Loan!.id}/repayments`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({});

      expect(res.status).toBe(404);
    });

    it('User 2 dashboard summary shows 0 loans', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalLoansCount).toBe(0);
      expect(res.body.data.totalLentPaise).toBe(0);
    });

    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/loans');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('5. Token Refresh & Logout', () => {
    it('POST /api/v1/auth/refresh rotates refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user1RefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(user1RefreshToken); // Rotated

      // Old refresh token is now revoked
      const replayRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user1RefreshToken });

      expect(replayRes.status).toBe(401);
    });

    it('POST /api/v1/auth/logout revokes session', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: user1RefreshToken });

      expect(res.status).toBe(200);
    });
  });
});
