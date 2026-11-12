# ==========================================
# Multi-stage Dockerfile for VetCare API
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL required by Prisma engine
RUN apk add --no-cache openssl

# Copy package descriptors and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy configuration and TypeScript source code
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript (dist)
RUN npm run build

# Stage 2: Production Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL required by Prisma runtime engine
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependencies and Prisma generated client from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./

# Fix line endings and set execution permission on entrypoint
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
