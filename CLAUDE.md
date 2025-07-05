# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpaceCrawler is a web crawling and content curation system for voice AI-related content. The project consists of three main components:
1. **Web Crawlers** - Automated scrapers for jobs, events, and products
2. **Admin Dashboard** - Review interface for approving/editing crawled content  
3. **Public Website** - voiceaispace.com where approved content is published

## Build and Development Commands

Since this is a greenfield JavaScript/TypeScript project, you'll need to set up the following:

### Initial Setup
```bash
# Initialize the project (when package.json exists)
npm install

# Start development server (when configured)
npm run dev

# Build for production
npm run build
```

### Code Quality Commands
```bash
# Run the smart lint hook - THIS IS MANDATORY AND BLOCKING
./hooks/smart-lint.sh

# When package.json is set up, use:
npm run lint      # Run ESLint
npm run format    # Run Prettier
npm run test      # Run tests
npm run typecheck # Run TypeScript type checking
```

**CRITICAL**: The `smart-lint.sh` hook enforces ZERO tolerance for errors. All issues are blocking and must be fixed immediately.

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js/React (based on .gitignore entries)
- **Backend**: Node.js/TypeScript
- **Database**: Supabase (PostgreSQL) - MCP server configured
- **Deployment**: Likely Vercel or Cloudflare Workers

### Data Flow
1. Crawlers fetch data from configured sources
2. Data is sent to admin dashboard for review
3. Admin approves/edits content via "Send to Space" button
4. Approved content is stored in Supabase
5. Public website displays approved content

### Crawler Sources
- **Jobs**: Company career pages (LiveKit, Speechmatics, Deepgram, etc.)
- **Events**: Lu.ma platform (search for "voice AI")
- **Products**: YCombinator, Product Hunt, AI directories

## Development Workflow

### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore requirements and existing patterns
2. **Plan**: Create detailed implementation plan with TodoWrite
3. **Implement**: Execute with validation checkpoints

### Use Multiple Agents
Leverage parallel execution for efficiency:
- Spawn agents for different components simultaneously
- Use separate agents for tests and implementation
- Delegate research tasks across multiple agents

### Reality Checkpoints
Stop and validate:
- After implementing complete features
- Before starting new components
- When hooks report ANY issues
- Before declaring "done"

## Supabase Integration

You have direct access to Supabase via MCP tools. Use these to:
- Create database schemas and tables
- Set up Row Level Security (RLS) policies
- Execute migrations and queries
- Generate TypeScript types from schema

Key MCP commands:
- `mcp__supabase__list_projects` - Find project ID
- `mcp__supabase__apply_migration` - Run DDL operations
- `mcp__supabase__execute_sql` - Query data
- `mcp__supabase__get_advisors` - Check security/performance

## Critical Requirements

### Zero Tolerance for Issues
- **ALL hook failures are BLOCKING** - Fix immediately
- No formatting issues
- No linting violations  
- No test failures
- Everything must be ✅ GREEN

### Code Standards
- **Delete old code** when replacing
- **Meaningful names**: `userID` not `id`
- **Early returns** to reduce nesting
- **No TODOs** in final code
- **Simple, obvious solutions** over clever abstractions

### Product-Specific Requirements

#### AI Product Description Format
When generating product descriptions, follow this exact structure:
1. 10-word factual description
2. Company name and tagline as header
3. Main description paragraph
4. Key Features section with bullet points
5. Use Cases section
6. Getting Started section (URLs only)
7. Closing summary paragraph

**Important**: Never include citation markers or reference numbers in descriptions.

## Project Status

Currently in initial setup phase. Next steps:
1. Initialize Next.js project with TypeScript
2. Set up Supabase database schema
3. Implement crawler architecture
4. Build admin dashboard UI
5. Create public website frontend

## Running the Project

Once initialized:
```bash
# Development
npm run dev

# Quality checks (MANDATORY before any commit)
./hooks/smart-lint.sh
npm run lint
npm run test
npm run typecheck

# Build
npm run build
```

Remember: The simple, obvious solution is usually correct. When in doubt, ask for clarification rather than making assumptions.