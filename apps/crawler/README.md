# SpaceCrawler - Web Crawler Service

This service crawls voice AI-related content from various sources including job boards, event platforms, and product directories.

## Features

- **Automated Scheduling**: Runs crawlers at configured intervals using cron expressions
- **Multiple Crawler Types**: Jobs, Events, and Products crawlers
- **Retry Logic**: Automatic retry with configurable attempts and delays
- **Concurrent Execution**: Manages concurrent crawler runs with limits
- **Structured Logging**: Winston-based logging with file and console outputs
- **Database Integration**: Logs all runs to Supabase for monitoring
- **Docker Support**: Production-ready Docker configuration
- **Health Monitoring**: Built-in health checks and performance monitoring

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Install Playwright browsers (for dynamic content):
```bash
npx playwright install chromium
```

## Usage

### Automated Scheduling (Production)

Start the scheduler service:
```bash
# Production mode
npm run start schedule

# Development mode (runs every 5 minutes)
npm run schedule:dev

# Using Docker
docker-compose up crawler
```

### Manual Runs

Run specific crawlers:
```bash
# Run individual crawlers
npm run crawl:jobs
npm run crawl:events
npm run crawl:products

# Run all crawlers
npm run crawl:all

# Run through scheduler (with retry logic)
npm run run jobs
npm run run events
npm run run products
```

### Management Commands

```bash
# Check scheduler status
npm run status

# Run health checks
npx tsx src/scripts/health-check.ts

# View logs
tail -f logs/combined.log

# Use management script (from project root)
./scripts/crawler-manager.sh start
./scripts/crawler-manager.sh stop
./scripts/crawler-manager.sh health
```

## Development

```bash
# Run in watch mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

## Architecture

- **Base Crawler**: Abstract class providing common crawling functionality
- **Specific Crawlers**: Jobs, Events, and Products crawlers extending the base
- **Crawler Scheduler**: Manages automated runs with cron expressions
- **Data Validation**: Zod schemas for type-safe data handling
- **Storage**: Direct integration with Supabase for data persistence
- **Logging**: Winston-based structured logging system
- **Health Monitoring**: Built-in health checks for all components

### Configuration

The scheduler is configured in `src/config/scheduler.config.ts`:

- **Development Mode**: Crawlers run every 5 minutes when `CRAWLER_SCHEDULE_OVERRIDE=true`
- **Production Mode**:
  - Jobs: Every 6 hours
  - Events: Every 12 hours
  - Products: Once daily at 5 AM UTC

### Environment Variables

```bash
NODE_ENV=production              # Set to 'production' for production mode
SUPABASE_URL=https://...        # Your Supabase project URL
SUPABASE_ANON_KEY=...           # Supabase anonymous key
SUPABASE_SERVICE_KEY=...        # Supabase service key
LOG_LEVEL=info                  # Logging level (error, warn, info, debug)
CRAWLER_SCHEDULE_OVERRIDE=false # Set to 'true' for frequent runs in dev
```

## Crawler Sources

### Jobs
- LiveKit
- Speechmatics  
- Deepgram
- AssemblyAI
- ElevenLabs

### Events
- Lu.ma (searching for "voice AI" events)

### Products
- Product Hunt
- Y Combinator companies
