# Build stage
FROM node:20-alpine AS builder

# Install dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Set Playwright to skip browser download since we're using system Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/crawler/package*.json ./apps/crawler/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/crawler ./apps/crawler
COPY packages ./packages

# Build the crawler app
RUN npm run build -w @spacecrawler/crawler

# Production stage
FROM node:20-alpine

# Install runtime dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Playwright environment variables
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/crawler/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/crawler/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose health check port (optional)
EXPOSE 3001

# Default command - start scheduler in production mode
CMD ["node", "dist/index.js", "schedule"]