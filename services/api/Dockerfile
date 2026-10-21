# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/api/package*.json ./services/api/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/shared ./packages/shared
COPY services/api ./services/api

# Build shared package
RUN npm run build --workspace=@miniledger/shared

# Generate Prisma client and build API
WORKDIR /app/services/api
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy necessary packages and build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/api/package*.json ./services/api/
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/prisma ./services/api/prisma

# Create directory for uploads
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

WORKDIR /app/services/api
CMD ["node", "dist/server.js"]
