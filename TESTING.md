# SpaceCrawler Testing Guide

This document provides a comprehensive guide to testing in the SpaceCrawler project.

## Overview

SpaceCrawler uses Jest as the primary testing framework across all applications:
- **Crawler App**: Unit tests for crawlers, scheduler, and data validation
- **Admin Dashboard**: Component tests, auth middleware tests, and integration tests
- **Public Website**: Component tests, page tests, and user interaction tests

## Running Tests

### All Apps
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Generate coverage report
npm run coverage:report
```

### Individual Apps
```bash
# Crawler app
cd apps/crawler
npm test

# Admin dashboard
cd apps/admin
npm test

# Public website
cd apps/web
npm test
```

## Test Structure

### Crawler App (`/apps/crawler`)
```
src/__tests__/
├── setup.ts                    # Test environment setup
├── lib/
│   ├── base-crawler.test.ts   # Base crawler class tests
│   └── crawler-scheduler.test.ts # Scheduler tests
├── crawlers/
│   ├── jobs.test.ts           # Jobs crawler tests
│   ├── events.test.ts         # Events crawler tests
│   └── products.test.ts       # Products crawler tests
└── utils/
    ├── factories.ts           # Mock data factories
    └── test-helpers.ts        # Test utilities
```

### Admin Dashboard (`/apps/admin`)
```
__tests__/
├── components/
│   ├── job-card.test.tsx      # Job card component tests
│   ├── event-card.test.tsx    # Event card component tests
│   └── product-card.test.tsx  # Product card component tests
├── app/
│   └── jobs/
│       └── jobs-review-list.test.tsx # Review list tests
├── middleware.test.ts         # Auth middleware tests
└── utils/
    ├── test-utils.tsx         # React testing utilities
    └── factories.ts           # Mock data factories
```

### Public Website (`/apps/web`)
```
__tests__/
├── components/
│   ├── job-card.test.tsx      # Public job card tests
│   ├── event-card.test.tsx    # Public event card tests
│   ├── product-card.test.tsx  # Public product card tests
│   └── search-bar.test.tsx    # Search functionality tests
├── app/
│   └── jobs/
│       └── page.test.tsx      # Jobs page tests
└── utils/
    ├── test-utils.tsx         # React testing utilities
    └── factories.ts           # Mock data factories
```

## Writing Tests

### Component Tests (React)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from '@/components/component-name'
import { createMockData } from '../utils/factories'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName data={createMockData()} />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const mockHandler = jest.fn()
    render(<ComponentName onClick={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### Crawler Tests
```typescript
import { CrawlerName } from '../../crawlers/crawler-name'
import { createMockHTML } from '../utils/factories'

jest.mock('node-fetch')
jest.mock('../../lib/supabase')

describe('CrawlerName', () => {
  it('should extract data correctly', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue(createMockHTML())
    })

    const results = await crawler.run()
    
    expect(results).toHaveLength(expectedCount)
    expect(results[0]).toMatchObject({
      // Expected structure
    })
  })
})
```

## Test Utilities

### Mock Data Factories
Each app has factories for creating mock data:
```typescript
// Create a single mock job
const job = createMockJob({ title: 'Custom Title' })

// Create multiple mock events
const events = createMockEvents(5)

// Create mock HTML responses
const html = createMockJobsHTML()
```

### Test Helpers
- `renderWithRouter`: Render components with Next.js router context
- `createMockSupabaseClient`: Mock Supabase client for testing
- `wait`: Async wait utility for testing timing-dependent code

## Coverage Requirements

All apps maintain a minimum of 80% code coverage across:
- Lines
- Statements  
- Functions
- Branches

Coverage reports are generated in each app's `coverage/` directory.

## Continuous Integration

Tests run automatically on:
- Every push to `main` branch
- Every pull request

The CI pipeline:
1. Runs linting
2. Runs type checking
3. Runs all tests with coverage
4. Uploads coverage to Codecov
5. Fails if coverage drops below threshold

## Best Practices

1. **Write tests alongside features**: Don't defer testing
2. **Use factories for consistency**: Leverage mock data factories
3. **Test user behavior**: Focus on how users interact with the app
4. **Mock external dependencies**: Isolate units under test
5. **Keep tests focused**: One concept per test
6. **Use descriptive test names**: Tests should document behavior
7. **Avoid testing implementation details**: Test outcomes, not internals

## Debugging Tests

### Run a single test file
```bash
npm test -- path/to/test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should handle errors"
```

### Debug in VS Code
1. Add breakpoint in test file
2. Run "Debug Jest Tests" from VS Code
3. Tests will pause at breakpoints

## Common Issues

### Module Resolution
If you see module resolution errors, ensure:
- TypeScript paths are configured in `tsconfig.json`
- Jest moduleNameMapper matches TypeScript paths

### Async Testing
Always use `waitFor` for async operations:
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### React 18 / Next.js 13+ Testing
The test setup handles:
- New React 18 rendering behavior
- Next.js App Router mocking
- Server Components (tested as regular components)

## Adding New Tests

1. Create test file next to the code being tested
2. Import necessary testing utilities
3. Write descriptive test cases
4. Run tests to ensure they pass
5. Check coverage hasn't decreased
6. Commit tests with the feature

Remember: Tests are documentation. Write them clearly!