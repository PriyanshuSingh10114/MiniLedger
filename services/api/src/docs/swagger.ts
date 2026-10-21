export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MiniLedger REST API',
    version: '1.0.0',
    description: `
**MiniLedger API** is a personal money-lending tracker API designed for secure financial bookkeeping.

### Currency Semantics
All monetary amounts in the database and underlying calculations are represented as **integer paise** (1 Rupee = 100 paise) to prevent floating-point inaccuracies. API inputs accept rupees (formatted decimal string or number) or paise, and return both paise and rupee representations.

### Date & Timezone Semantics
All loan due dates follow standard \`YYYY-MM-DD\` calendar dates evaluated against the **Asia/Kolkata (IST)** business timezone. Loans are marked overdue when \`dueDate < today\` and remaining balance > 0.

### Authentication & Dev OTP
Authentication uses phone numbers with 6-digit OTP verification.
In development mode (\`ENABLE_DEV_OTP=true\`), the generated OTP is logged directly to the server logs. In production mode, this flag fails closed.
Authentication returns short-lived JWT access tokens (15m) and cryptographically secure refresh tokens with automatic token rotation.
    `,
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base URL',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Bearer access token',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request payload' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          phoneNumber: { type: 'string', example: '+919876543210' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Loan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          friendName: { type: 'string', example: 'Rahul Sharma' },
          amount: { type: 'integer', description: 'Amount in paise', example: 500000 },
          amountInRupees: { type: 'number', description: 'Amount in Rupees', example: 5000 },
          dueDate: { type: 'string', format: 'date', example: '2026-11-15' },
          status: { type: 'string', enum: ['OUTSTANDING', 'REPAID'], example: 'OUTSTANDING' },
          note: { type: 'string', nullable: true, example: 'Dinner share' },
          isOverdue: { type: 'boolean', example: false },
          outstandingAmount: { type: 'integer', example: 500000 },
          repaidAmount: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          totalLentPaise: { type: 'integer', example: 2500000 },
          totalRepaidPaise: { type: 'integer', example: 1000000 },
          totalOutstandingPaise: { type: 'integer', example: 1500000 },
          totalOverduePaise: { type: 'integer', example: 500000 },
          activeLoansCount: { type: 'integer', example: 3 },
          overdueLoansCount: { type: 'integer', example: 1 },
          repaidLoansCount: { type: 'integer', example: 2 },
          totalLoansCount: { type: 'integer', example: 5 },
          recentLoans: { type: 'array', items: { $ref: '#/components/schemas/Loan' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: {
          200: {
            description: 'API and database health status',
          },
        },
      },
    },
    '/auth/request-otp': {
      post: {
        summary: 'Request OTP for a phone number',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phoneNumber'],
                properties: {
                  phoneNumber: { type: 'string', example: '+919876543210' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP sent successfully' },
          400: { $ref: '#/components/schemas/ErrorResponse' },
          429: { description: 'Rate limit or cooldown exceeded' },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        summary: 'Verify OTP and receive session tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phoneNumber', 'otp'],
                properties: {
                  phoneNumber: { type: 'string', example: '+919876543210' },
                  otp: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful with access & refresh tokens' },
          400: { description: 'Invalid or expired OTP' },
          429: { description: 'Too many failed attempts' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and obtain new access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Refreshed successfully' },
          401: { description: 'Invalid or revoked refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Revoke refresh session',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/users/me': {
      get: {
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/loans': {
      get: {
        summary: 'List loans for authenticated user',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['OUTSTANDING', 'REPAID', 'ALL'] },
          },
          { name: 'isOverdue', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['dueDate', 'createdAt', 'amount'] },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'List of paginated loans' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create a new loan',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['friendName', 'amount', 'dueDate'],
                properties: {
                  friendName: { type: 'string', example: 'Amit Kumar' },
                  amount: {
                    type: 'number',
                    example: 2500,
                    description: 'Rupees (number or string)',
                  },
                  dueDate: { type: 'string', format: 'date', example: '2026-11-20' },
                  note: { type: 'string', example: 'College tuition loan' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Loan created successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/loans/{id}': {
      get: {
        summary: 'Get loan details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Loan details' },
          404: { description: 'Loan not found' },
        },
      },
    },
    '/loans/{id}/repayments': {
      post: {
        summary: 'Mark loan as fully repaid',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  idempotencyKey: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Loan marked as repaid' },
          400: { description: 'Already repaid or invalid balance' },
          404: { description: 'Loan not found' },
        },
      },
      get: {
        summary: 'Get repayment history for a loan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Repayment history' },
        },
      },
    },
    '/dashboard/summary': {
      get: {
        summary: 'Get financial summary and aggregates for dashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Financial dashboard metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DashboardSummary' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/loans/{id}/receipt': {
      post: {
        summary: 'Upload receipt image/document for loan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  receipt: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Receipt attached' },
        },
      },
      get: {
        summary: 'Download/stream attached receipt file',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'File binary stream' },
          404: { description: 'Receipt not found' },
        },
      },
      delete: {
        summary: 'Delete attached receipt',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Receipt deleted' },
        },
      },
    },
  },
};
