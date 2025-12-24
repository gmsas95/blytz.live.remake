# Frontend Dockerfile - Node.js Production Server (Fixed Dependencies)
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fixed - using --legacy-peer-deps)
RUN npm ci --legacy-peer-deps

# Copy source code (fixed - no frontend/ subdirectory)
COPY . .

# Build application
RUN npm run build

# Production stage with Node.js
FROM node:20-alpine AS production

# Install serve for static files
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactapp -u 1001

# Set working directory
WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/dist /app

# Change ownership
RUN chown -R reactapp:nodejs /app

# Switch to non-root user
USER reactapp

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start of server
CMD ["serve", "-s", "/app", "-l", "3000"]